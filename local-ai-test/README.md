# Pass C test — can a local model classify relationships?

One question: **can a local model reproduce relationship decisions you already made by hand?**

If yes, the full pipeline is worth building. If no, we stop here having spent an
evening. Nothing is written to your database — this is read-only.

---

## What you need

- A PC with an NVIDIA GPU (12GB+ VRAM ideal; 8GB works with the 8b model)
- Node 18+ (`node --version`)
- Your `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ~6GB disk for the model

You do **not** need: the app running, `npm install`, or any API key.

---

## Step 1 — Copy these files to the test PC

Copy the `local-ai-test/` folder and your `.env` file. Layout must be:

```
some-folder/
  .env                     <- VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
  local-ai-test/
    test-pass-c.mjs
    relationship-vocabulary.mjs
    README.md
```

The script looks for `.env` one level **above** itself.

## Step 2 — Install Ollama

Download from <https://ollama.com/download>. Verify:

```bash
ollama --version
```

## Step 3 — Pull the model

```bash
ollama pull granite4.1:8b
```

5.3GB. IBM Granite 4.1, dense 8B, Apache 2.0, explicitly built for
"tool use and structured JSON output" with classification and extraction in its
stated capabilities — which is exactly this task.

Confirm it's serving:

```bash
ollama list
curl http://localhost:11434/api/tags
```

(If nothing responds, run `ollama serve` in a separate terminal.)

## Step 4 — Pick a session to test against

```bash
cd local-ai-test
node test-pass-c.mjs --list
```

Prints your sessions newest-first with their UUIDs.

**Choose carefully — this is the most important choice in the test.** Pick a
session where you did a _thorough_ job of adding relationships by hand. The test
scores the model against your existing data, so if that session's relationships
are sparse, every correct proposal looks like a false positive.

## Step 5 — Run it

Start small:

```bash
node test-pass-c.mjs --session <uuid> --limit 20 --verbose
```

`--verbose` prints each decision as it goes, so you can see whether it's sane
before committing to a full run. Then the whole session:

```bash
node test-pass-c.mjs --session <uuid>
```

Expect roughly 1–3s per pair; a full session is a few minutes.

---

## Reading the output

```
Correctly said NONE      <- avoided noise. Good.
Found + right type       <- ideal
Found + WRONG type       <- you'd fix a dropdown. Cheap.
MISSED (said NONE)       <- you'd add by hand. Same as today.
SPURIOUS (invented)      <- you'd reject. This is the expensive kind.
```

**Precision matters more than recall.** A spurious link costs you attention; a
missed one is just the manual work you already do.

| Result                        | Verdict                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| precision >80%, spurious <10% | build the pipeline                                           |
| precision 60–80%              | tune `relationship-vocabulary.mjs`, rerun                    |
| precision <60% on 8b          | try `--model granite4.1:30b` (17GB, offloads to RAM, slower) |
| still <60% on 30b             | local models can't do this. Stop.                            |

**Check the SPURIOUS list by hand.** "You didn't record it" is not the same as
"wrong" — some may be relationships you missed. That distinction changes the
verdict, so don't trust the headline number alone.

Full results are written to `pass-c-results-<timestamp>.json`.

---

## Tuning

Almost all quality lives in `relationship-vocabulary.mjs`, not the script. Each
type has `when` / `not` / `example`. If the model confuses two types, sharpen the
`not` clause on both. Common ones:

- `located_in` vs `residence_relation` vs `encountered` — the passer-by problem
- `member_of` vs `affiliated_with` — formal vs loose
- `parent_location` direction — child first, container second

`temperature: 0` is set, so a rerun on unchanged input gives an identical answer.
Any change in output came from your prompt edit, not from sampling noise.

---

## Options

| Flag               | Default                  | Purpose                   |
| ------------------ | ------------------------ | ------------------------- |
| `--session <uuid>` | —                        | required                  |
| `--list`           | —                        | list sessions and exit    |
| `--model <name>`   | `granite4.1:8b`          | try `granite4.1:30b`      |
| `--limit <n>`      | 0 (all)                  | cap pairs for a quick run |
| `--verbose`        | off                      | print every decision      |
| `--ollama <url>`   | `http://localhost:11434` | remote Ollama             |

Want more throughput? `OLLAMA_NUM_PARALLEL=4 ollama serve` — an 8b model leaves
plenty of VRAM spare on a 12GB card, and roughly triples pair throughput.

---

## What this does and doesn't prove

**Does:** whether a local model can classify relationship types from your prose,
measured against your own hand-made data.

**Doesn't:** entity extraction (pass A), timeline events (D), or combat parsing
(E). Those are easier than C — if C works, they will. C is tested first because
it's the one most likely to fail.

## Not tested end-to-end

I wrote this without a GPU or a local model available, so the Ollama call path is
unverified. The deterministic half (pair generation, alias matching, word
boundaries, scoring) **is** tested and passing. If the model call fails, it'll be
something small — a field name in the Ollama response, most likely — and the
error message will say which.

---

# Full pipeline test

Once pass C looks acceptable, this runs every pass and emits an import payload.
**Writes nothing to your database.**

```bash
# reuse an existing session's narrative (best first test — you can compare
# against what you built by hand)
node test-pipeline.mjs --session <uuid> --verbose

# or a fresh narrative file
node test-pipeline.mjs --narrative session21.txt --campaign <campaign-uuid>

# one pass at a time while tuning
node test-pipeline.mjs --session <uuid> --passes A
node test-pipeline.mjs --session <uuid> --passes A,B
```

## The passes

| Order | Pass  | Does                                        | Model?                      |
| ----- | ----- | ------------------------------------------- | --------------------------- |
| 1     | A     | discover named entities + type + aliases    | yes                         |
| 2     | B1    | match against existing entities             | **no** — name normalisation |
| 3     | B2    | write description + attributes for NEW      | yes                         |
| 4     | B3    | propose description updates for EXISTING    | yes                         |
| 5     | **D** | **timeline events + their entity mentions** | yes                         |
| 6     | C     | semantic relationships between entities     | yes                         |

**D runs before C** because timeline events are linkable entities in your schema:
a `session_events` row gets `entity_relationships` with
`from_entity_id = <event id>` and `relationship_type: 'mention'` — exactly what
the admin Scanner tab applies. So each event gets a ref, and its mentions land in
the same relationship list pass C contributes to.

Three kinds of relationship come out, reported separately:

| Kind              | From       | Example                                           |
| ----------------- | ---------- | ------------------------------------------------- |
| event -> entity   | `event_03` | `[Soranna Warns the Party] -> Captain Soranna`    |
| session -> entity | `SESSION`  | union of everything appearing in any event        |
| semantic (pass C) | entity     | `Soranna -[workplace_relation]-> Drellin's Ferry` |

## Guards against hallucination

- **Pass A rejects any entity whose name/quote isn't in the narrative.** Printed
  as `[reject]` with `--verbose`.
- **Evidence-first schemas.** Every schema puts `quote`/`evidence` before the
  decision field. Constrained decoding emits fields in order, so the model must
  ground itself before answering. (Pass C v2 had this backwards and answered
  first, rationalised second — it said NONE to all 20 pairs.)
- **Attributes accept `UNKNOWN`** and those are stripped, so unstated fields stay
  empty rather than being invented.
- **Enum-constrained attributes** — `affinity`, `status`, `rarity`, location
  `type`, quest `priority` can only take valid values.
- **B3 diffs old vs new** and flags `descriptionChanged`, so an unchanged entity
  produces no update.

## Name matching (pass B1, no model)

Strips titles and punctuation, lowercases, collapses whitespace — so
`Captain Soranna`, `Lady Soranna`, `SORANNA`, `Soranna,` all resolve to the same
existing NPC. Titles handled: captain, lord, lady, sir, dame, king, queen,
prince(ss), duke, baron, master, mistress, father, mother, brother, sister,
elder, chief, general, sergeant, commander, "the".

Type must also match, so a location named "Soranna" would not collide with the NPC.

## The payload

Ref-based, not id-based, so **it works on an empty campaign**. Entities get local
refs (`npc_soranna`) and relationships point at those refs. An importer resolves
in two passes: create entities recording ref->uuid, then create relationships
resolving both endpoints. Declaration order doesn't matter, and a relationship
between two not-yet-existing entities is fine.

Existing entities use `existing_<uuid>` refs, so relationships can span new and
old freely.

## Expected timing

For ~4000 words on a 4070 Ti, fully GPU-resident:

| Pass | Calls                 | Time      |
| ---- | --------------------- | --------- |
| A    | 1 (whole narrative)   | 30-60s    |
| B2   | 1 per new entity      | ~5s each  |
| B3   | 1 per existing entity | ~5s each  |
| C    | 1 per candidate pair  | 1-2s each |
| D    | 1                     | 30-60s    |

Typically 5-15 min total. Check `ollama ps` shows ~100% GPU first — a CPU split
makes it 10-30x slower.

## What to check in the output

1. **Are the new entities real?** Any invented ones = pass A prompt needs work.
2. **Do descriptions only contain what the narrative says?** Watch for
   plausible-sounding detail that isn't in the text.
3. **Are B3 updates additive?** They should extend, not overwrite.
4. **Do the event titles read like a recap you'd publish?**
5. **`[!] unmatched names` in events** = pass D invented an entity pass A didn't
   find, or used a different name form.

None of this is tested against a real model — I have no GPU here. The
deterministic parts (name matching, hallucination rejection, pair generation,
payload shape) are tested and passing.
