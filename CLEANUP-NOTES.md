# Cleanup — Phases 1 & 2

Behaviour-preserving cleanup. No feature changes.
Backup of pre-cleanup state: `../dnd-campaign-manager-BACKUP-pre-cleanup`

## How to verify

```
npm install
npm run verify     # check:imports && lint && build
```

`npm run check:imports` runs with **zero dependencies installed** — it resolves
every local import and confirms each named binding exists. That was the stand-in
for `vite build` during this pass. It is NOT a substitute for a real build: it
validates imports, not rendering.

## Phase 1 — deletions (~1,900 lines)

18 unreferenced files removed. All confirmed to have zero importers, including
zero _dynamic_ importers (`React.lazy`):

- Superseded: `atlas/useMapData.js`, `dashboard/{QuickInsights,InsightsGrid,ActiveThreads,QuestJournal}`,
  `admin/pages/{EntityListPage,EntityEditorPage}` (routes go to SplitPaneManager),
  `shared/components/markdown/{MarkdownWithToC,MarkdownRenderer}`, `shared/utils/theme/*`
- Unused: `atlas/components/__MapLayerControl`, `atlas/config/mapConfig` (empty),
  `EntityStatusIcon`, `TocItem`, `CollapsibleSection`,
  `admin/.../atlas/components/{PathStylePopup,SegmentedControl}`
- Duplicate service impls: dead `getWikiEntry` + 3 private helpers and dead
  `getGraphData` removed from `entityService.js`. Both had live twins in
  `wikiService.js` / `graphService.js`, and had **diverged** — the dead
  `getWikiEntry` was missing the `encounters.timeline` fetch.

`Card.jsx` kept deliberately (unreferenced, but a reusable primitive).
Node codegen scripts moved out of `src/` to `scripts/legacy/`.

## Phase 2 — consolidation

| What                     | Before                       | After                                     |
| ------------------------ | ---------------------------- | ----------------------------------------- |
| `parseAttributes`        | 2 impls, different behaviour | 1 (`domain/entity/utils/attributeParser`) |
| `stripMarkdown`          | 3 impls, 3 behaviours        | 1 (`shared/utils/textUtils`)              |
| `escapeRegex`            | 3 identical copies           | 1                                         |
| storage access           | 12 raw sites, 4 patterns     | `shared/utils/storage.js`                 |
| `'sessions'`→`'session'` | 8 inline copies              | `normalizeTypeParam()`                    |

### Bugs fixed incidentally

1. **`parseAttributes` data loss.** The `imageUtils` copy returned `{}` for
   array-shaped attributes, silently dropping DB rows of the form
   `[{name, value}]`. 8 files imported the broken one. Now all use the
   array-aware version.
2. **`stripMarkdown` deleted inline code.** The wiki copy's regex had no capture
   group, so `` `fireball` `` became `""` instead of `fireball` — on every card
   excerpt.
3. **`stripMarkdown` mangled snake_case.** `Snake_case_word` → `Snakecaseword`,
   because the italic rule matched bare mid-word underscores.
4. **`useTheme` initialised to `undefined`.** It defaulted to `THEMES.LIGHT`,
   which is commented out — so no `data-theme` was set on first visit and the
   string `"undefined"` was persisted. Now defaults to DARK and validates stored
   values.
5. **`useTheme` threw in Safari private mode.** Unguarded `localStorage` access
   during state init. Now goes through the guarded wrapper.

`stripMarkdown` gained a `{ collapseWhitespace }` option to preserve the
newline-flattening the wiki card excerpts relied on.

## Also

- `npm run lint` script added (there was none, which is why the audit's issues
  went unnoticed); ESLint `ecmaVersion` 2020 → `latest` (code uses
  `findLastIndex`, ES2023).
- 4 dead `// import './types';` lines and ~45 stale `// FIX:` / `// CHANGED:`
  annotation comments removed. Rationale comments explaining _non-obvious
  decisions_ were kept and rewritten without the stale prefixes.

## Not done (deliberately)

- **Phase 3** (extract dot-grid utility, `useFullscreen`, `MobileInfoSheet`,
  `MasonryGrid`, `EntityLink` list variant to kill ~40 `!important`s)
- **Phase 4** (naming: 5 file/export mismatches, hook placement, `ViewModel` suffix)
- **Phase 5** (Prettier, the 9 broken `bg-*/10/30` classes)
- **react-leaflet → raw Leaflet** (Hippocratic-2.1 licence). Separate pass.
- Audit bug fixes not listed above — `gcTime`, `process.env` in ErrorBoundary,
  `EntityLink` href missing `#`, MapTools `bounds` prop. Kept separate so a
  behaviour change isn't mixed into a mechanical cleanup.

---

# Cleanup — Phases 3, 4 & 5

## Phase 3 — extracted repeated UI patterns

| Extracted                                       | Replaced                                            |
| ----------------------------------------------- | --------------------------------------------------- |
| `.bg-dot-grid` / `.bg-dot-grid-sm` (global.css) | 6 copies of the same inline `radial-gradient` style |
| `shared/hooks/useFullscreen.js`                 | 3 divergent fullscreen implementations              |
| `EntityLink` `variant='row'` + `trailing` slot  | ~40 `!important` utilities across 4 files           |
| `shared/components/layout/MobileInfoSheet.jsx`  | 2 near-identical vaul drawer blocks                 |
| `shared/components/layout/MasonryGrid.jsx`      | 3 copies of `columns-1 md:columns-2 xl:columns-3`   |

### Behaviour differences resolved (not just deduplicated)

- **Fullscreen now behaves the same everywhere.** Only `EntityLocalGraph` had the
  pseudo-fullscreen CSS fallback for browsers without the Fullscreen API (iOS
  Safari); `MapTools` and `EntityMiniMap` silently did nothing there. The hook
  takes the fallback as canonical.
- **Mobile info sheet** had drifted on z-index (`z-50` vs `z-[60]`) and drag-handle
  colour (hardcoded `bg-gray-300` vs theme-aware `bg-muted-foreground/30`). The
  theme-aware values won.

### Audit bugs fixed while in the same code

- **#9 Atlas "Center Map" button was a no-op.** `MapTools` read a `bounds` prop
  that `MapCanvas` never passed. Now passed.
- **#7 `EntityLink` href 404'd on ctrl+click.** The app uses HashRouter, so the
  real URL needs `#/wiki/...`; `onClick` masked it for normal clicks but
  ctrl+click / "open in new tab" bypass the handler. Now `#/wiki/...`.

## Phase 4 — naming and layout conventions

- **File name now matches exported name** in all 5 mismatched files:
  `GraphPage` (was `RelationshipGraph`), `TimelinePage` (was `TimelineView`),
  `WikiDetailPage` (was `WikiEntryPage`), `WikiEntryView` (was `WikiEntityView`),
  `EncounterManager` (was `EncounterActionManager`). Local import aliases updated
  to match too.
- **All 15 stray feature hooks moved to `<feature>/hooks/`.** No hooks remain at
  a feature root. `useAtlasSearch.jsx` -> `.js` (contained no JSX).
- **Dropped the `ViewModel` suffix** so file and hook names agree:
  `useGraphViewModel`->`useGraph` (`useGraphView.js`->`hooks/useGraph.js`),
  `useTimelineViewModel`->`useTimeline`, `useEntityViewModel`->`useEntityView`,
  `useGlobalSearchViewModel`->`useGlobalSearch`,
  `useMapCanvasViewModel`->`useMapCanvas`. `useNavigation.js` ->
  `hooks/useMainLayout.js` (matches its `useMainLayout` export).
- Relative imports inside moved files converted to `@/` aliases.

**Not done in Phase 4:** the default-vs-named export convention (76 vs 89) and
the service error convention (throw vs swallow). Both are broad behavioural
changes; the service one in particular changes what reaches the UI's error state,
so it wants its own pass with a running app.

## Phase 5 — formatting and guards

- **Fixed all 9 broken double-opacity Tailwind classes.** These were silently
  dropped by Tailwind, so: the active tab had no highlight (`TabContainer`), and
  completed vs failed quest objectives rendered identically
  (`QuestObjectives`). Also `EntitySidebar`, `SessionMentions`, `EntityBody`,
  `QuestObjectiveManager`, `SplitPaneManager`.
- **ESLint rule added** (`no-restricted-syntax`) so a two-opacity utility is now
  an error. Regex verified against all 9 real cases plus Tailwind's
  arbitrary-value syntax (`w-[calc(50%-1rem)]`, `object-[center_30%]`) to confirm
  no false positives.
- **ESLint now ignores** `dev_helpers`, `scripts/legacy`, and generated map data;
  Node globals configured for `scripts/`.
- **`.prettierrc.json` + `.prettierignore` added** codifying the existing style
  (tabs, single quotes, JSX single quotes, 120 cols, LF).

### The Prettier format pass has NOT been run

`prettier` was added to devDependencies but isn't installed here, so
`npm run format` still needs running on a machine with deps. Do it as its own
commit — it will touch nearly every file and would otherwise bury the diffs
above.

## Verification

Same caveat as before: imports and `.js` syntax are verified; **rendering is
not**. Phases 3-5 changed component structure and CSS, which is exactly what a
static check can't see. In particular, worth eyeballing after `npm run dev`:

- Atlas / graph / minimap backgrounds (dot-grid utility)
- Fullscreen on atlas, minimap, local graph
- Entity list rows in wiki sidebars, session mentions, character sidebar
- Mobile info sheet on a standard entity page and a character page
- Active tab highlight; completed vs failed quest objectives

---

# Gemini removal

Goal: cut Gemini completely, keep everything not Gemini-specific, leave room for
a different AI provider later.

**Verified: zero remaining references** to `gemini`, `generativelanguage`,
`aiSearch`, `aiMode`, `llmService`, `inferRelationships`, or `VITE_GEMINI_API_KEY`
anywhere in `src/`, `scripts/`, `.github/`, or `package.json`.

## Deleted (pure Gemini)

- `src/features/search/api/aiSearchService.js` (145)
- `src/features/admin/api/llmService.js` (135)
- `src/features/search/components/AiAnswer.jsx` (21)

## Stripped Gemini paths, kept the feature

**Global search** — keyword search was always independent, so it is unaffected.
Removed AI mode from `SearchContext`, `useGlobalSearch`, `SearchModal`,
`SearchResults`, `SearchFooter`, plus the `search-ai-mode` storage key.

`useGlobalSearch` lost `aiAnswer`/`aiLoading`/`aiError`/`submitAiSearch` and the
`showAiAnswer`/`showKeywordResults` flags; its duplicated result-mapping is now a
single `toViewModel` helper. `SearchResults` lost the interleaved AI branches
(group headers were conditional on `aiMode && aiError`) and gained a `ResultGroup`
sub-component. Both were on the audit's "convoluted" list; this removal happens
to resolve that.

The search form is now a plain `<div>` rather than a `<form>` — the form existed
only to submit AI queries. Enter still opens the selected result via the existing
keydown handler.

**Admin narrative scanner** — the panel had 3 phases and only the middle one was
Gemini:

| Phase | What                                                   | Kept?   |
| ----- | ------------------------------------------------------ | ------- |
| 1     | `scanSession()` — regex/token entity-mention detection | **Yes** |
| 2     | `inferRelationships()` — LLM relationship inference    | Removed |
| 3     | Apply selected suggestions as relationships            | **Yes** |

559 -> 359 lines. Phase 1 + 3 are the useful part: scan a session narrative,
review detected entity mentions, apply them as `mention` relationships. That path
never touched Gemini and already worked when no key was set.

Kept because still used elsewhere: `narrativeScanner.js` (Phase 1) and
`config/relationshipTypes.js` (used by `RelationshipManager`).

## CI

Removed `VITE_GEMINI_API_KEY` from `.github/workflows/deploy.yml`.

**Still to do on your side:** delete the `VITE_GEMINI_API_KEY` GitHub Actions
secret, and **revoke the key in Google Cloud Console**. It was inlined into every
published bundle by Vite, so treat it as public regardless of this cleanup.

## Adding a provider later

The seams are clean if you want to revisit this:

- **Search**: `searchService.globalSearch()` is the single entry point;
  `useGlobalSearch` returns a flat view model. An AI layer would slot in
  alongside, not inside.
- **Admin**: `narrativeScanner.scanSession()` already produces the entity list an
  inference call would need, and `RELATIONSHIP_TYPES` is the constrained
  vocabulary. Phase 3's `addRelationship` loop can apply suggestions from any
  source.

Note that a browser-only app on GitHub Pages cannot hold a provider secret — any
key in the bundle is public. A forever-free option would need to either be
genuinely public-safe (referrer-restricted + hard quota cap, accepting that others
can burn it) or run through something like a Supabase Edge Function, which stays
within the no-server-of-your-own constraint since Supabase is already your backend.

---

# Phase 7 — lint to zero

`npx eslint .` now reports **0 errors, 0 warnings** (from 94 errors / 18 warnings),
`npx prettier --check .` passes, and `npx vite build` succeeds.

## The config fix that mattered most: `eslint-rules/jsx-uses-vars.js`

The old config carried `varsIgnorePattern: '^[A-Z_]'`, a workaround for the fact
that core `no-unused-vars` does not count JSX references — a prop rendered as
`<Icon />` was reported unused. That pattern silenced the false positives but also
**hid 82 genuinely unused imports**, because components and constants are
capitalised by convention.

Replaced with a ~15-line local rule that marks JSX-referenced identifiers as used
(what eslint-plugin-react's `jsx-uses-vars` does; adding that dependency for one
rule was not worth it). The blanket pattern is gone, so real unused values surface
again. Verified in both directions: `<cfg.icon />` and `<Icon />` are clean, while
unused capitalised vars are still reported.

This is the same false positive that caused the earlier
`ReferenceError: config is not defined` — renaming a used prop to `_config` to
silence the rule. The rule now prevents that class of "fix".

## `scripts/prune-unused-imports.mjs`

Removes unused import specifiers by rebuilding the statement from the espree AST,
rather than pattern-matching text (these imports span multiple lines and mix
default/named forms, where regex edits corrupt code). It deliberately touches
**only imports** — 8 unused _locals_ were held back for review, since each needed
a judgement call. Run it as:

    npx eslint . -f json > lint.json
    node scripts/prune-unused-imports.mjs lint.json          # dry run
    node scripts/prune-unused-imports.mjs lint.json --apply

## Bugs found while fixing the lint

The warnings were not all cosmetic. Fixing them properly surfaced real defects:

- **`AtlasEditorContext.saveMap`** was a plain function excluded from the context
  value's `useMemo` deps, so a consumer could call a `saveMap` closed over stale
  `state` and **persist outdated map data**.
- **`AttributeValueInput`** (list + map editors) pushed state to the parent from an
  effect that ran on mount, reporting a change before any user edit — marking a
  pristine form dirty. Also mutated a row object in place. Now commits from the
  handlers.
- **`QuestObjectiveManager`** listed only `[questId]`, so switching campaign left
  the previous campaign's sessions in the objective dropdown.
- **`CharacterSidebar`** parsed `proficiencies`/`tools` and added them to
  `ignoredKeys` — excluding them from the generic attribute dump — but never
  rendered them, so **that data vanished from the sheet**.
- **`RelationshipManager` / `SessionEventManager`** tracked a `loading` flag that
  was never read, so an in-flight fetch was indistinguishable from "none".
- **`MapZoomHandler`** depended on `[map]` only, so a changed `referenceZoom` was
  ignored until the next zoom event.
- **`EntityMiniMap` / `EntityEmbed` / `useSmartPosition`** could apply a slow
  async result (image bounds, brightness, position) to a _newer_ target. Now the
  result is stored keyed to its input and "is it ready?" is derived.

## `react-hooks/set-state-in-effect` (11 → 0)

The rule's real trigger, established by probing it with scratch files rather than
assuming: `setState` in an effect is accepted when the value comes from a DOM
measurement (`ref.current.getBoundingClientRect()`) or an async callback, and
reported when it sits in a guard branch or merely mirrors a prop.

Fixes used, in order of preference:

1. **Derive instead of store** — `useSmartPosition`, `EntityEmbed`,
   `EntityMiniMap`, `useMapCanvas`, `TableOfContents`.
2. **Adjust during render** — `Drawer`, `SmartImageInput`, `SmartColorPicker`,
   `ImageLibraryModal`, `VisualIconPicker`. React supports setting state while
   rendering to derive state from props; it re-renders before paint, so this is
   _fewer_ renders than the effect, not more.
3. **Measure at click time** — `SmartColorPicker`, `VisualIconPicker`. The trigger
   is already laid out when clicked, so render→measure→render collapses to one
   render and the popup never flashes at stale coordinates.

## Two deliberate suppressions

Both are documented at the site with the reason, not silenced generically:

- **`CytoscapeCanvas`** init effect omits `styles`/`onNodeClick`. Its cleanup
  destroys the graph, so re-running would lose zoom, pan and layout; a separate
  effect pushes style changes into the live instance instead.
- **`TacticalMapManager`** `initialData` omits `value`. The editor _produces_ new
  values, so recomputing would feed its own output back as initial data and reset
  the canvas mid-edit.

Note: `exhaustive-deps` and `static-components` report at the **dependency array /
use site**, not the declaration — so `eslint-disable-next-line` must sit there.

## `react-refresh/only-export-components` (5 → 0)

The five context files export a provider _and_ its hook — the pattern React's own
docs use. Splitting them meant a second file per context and rewriting ~45 call
sites for a dev-only HMR benefit. Used the rule's `allowExportNames` option to
name the five hooks instead of disabling the rule; verified that any _other_
non-component export in those files is still reported.

## Prettier

76 files reformatted. Verified semantically neutral by comparing the espree AST of
all 234 source files before and after: 226 byte-identical, and the 8 differences
were confined to `JSXText` whitespace (JSX indentation reflow, which collapses to
the same rendered output). `endOfLine: 'lf'` held — 0 of 275 files use CRLF.

---

# Phase 8 — routing (campaign in the URL)

The app now carries the campaign in the path: `#/c/:campaignId/wiki/:type/:entityId`,
etc. Previously `campaignId` lived only in localStorage, so a URL meant different
things on different machines and nothing was shareable.

## Which id (this bit was gotten wrong twice, then fixed)

`campaigns.id` is a **UUID**, and it is the value every entity row's `campaign_id`
column references. The separate integer `campaigns.campaign_id` column is only a
display/ordering number — NOT a foreign key target. The URL and all internal
identity use the UUID. Resolving by the integer returns a campaign whose entities
come back empty, or (since the column types differ) a query error. Verified
against the live DB.

## New pieces

- `src/app/routes.js` — every path in one place, as builder functions. `navConfig`
  and all call sites consume these; no more parallel copies of path strings.
- `src/app/hooks/useCampaignRoutes.js` — the builders with the current campaign
  already applied, read from context. Avoids threading campaignId through ~26
  link sites (each a chance to drop the prefix).
- `src/app/components/CampaignScope.jsx` — layout route guard for `/c/:campaignId`.
  Replaces a `campaignId ? <tree A> : <tree B>` ternary that changed the router's
  shape based on fetched data. Distinguishes loading / error / not-found /
  resolved as four separate states — conflating them is what made a bad id spin
  forever.
- `src/app/components/NotFound.jsx` — a real 404 showing the failed path, instead
  of `path='*' → <Navigate to='/'>` which silently swallowed dead links.
- `src/app/components/LegacyRedirect.jsx` — forwards pre-scope `#/wiki/...` links
  (in your notes / history) to the last-used campaign. Delete once old links are
  gone.
- `src/features/atlas/AtlasDefaultRedirect.jsx` — `/c/:id/atlas` resolves to the
  campaign's own `defaultMap`, with a fallback to the first map if the declared
  default doesn't resolve.

## Bugs found and fixed along the way

- `defaultMap: 'world_maps'` for Campaign 01 matched no map key (the key is
  `faerun_map`, from WORLD_MAPS.metadata.mapId). The redirect now validates the
  declared default and falls back, so it can't 404 on a bad config.
- The `/atlas/:mapId` route param was **vestigial** — nothing read it; map
  selection ran entirely through a `?map=` query string. Now `:mapId` is the
  source of truth (shareable), and only lat/lng/zoom stay in the query string as
  transient view state.
- `onSwitchCampaign` navigated to `/wiki/session`, which only landed on the picker
  because that route didn't exist without a campaign. Now goes to
  `routes.selectCampaign()` explicitly.
- `useCampaignData` was a hand-rolled effect; converted to TanStack Query so route
  resolution can tell loading from not-found from error.
- Stale non-UUID ids in localStorage (from an earlier integer-keyed build) are now
  rejected on read, so they can't rebuild a broken `/c/2` URL.

## Migrated call sites

26 link/navigate sites moved from hardcoded `/wiki/...` to `routes`/
`useCampaignRoutes`. Two module-scope config objects (EntityTableGroup's table
defs, viewStrategies' lane links) can't call hooks, so they receive the resolved
builder / an entity ref and let the rendering component build the path.
`useBreadcrumbs` and the Breadcrumbs blacklist were rewritten to strip the scope
prefix before interpreting segments.

Verified: lint 0/0, Prettier clean, build passes, check:imports passes, and the
UUID data flow (campaign + sessions) confirmed against the live database.

---

# Phase 6 — admin console

Done sequentially by hand (no agents), one slice at a time with a click-through
after each, because admin writes fire the sync-to-entities trigger cascade and
"saved nothing" is invisible to lint and build. A full DB backup was taken before
and between slices.

## 6b — TanStack Query for admin data

- `invalidateEntityData(queryClient)` (new) replaces two bare
  `queryClient.invalidateQueries()` calls that nuked _every_ cache in the app. The
  new helper invalidates an explicit, documented list of the entity-derived keys —
  deliberately broad, because the sync triggers mean an entity write legitimately
  affects search/graph/timeline/dashboard/wiki. `tooltip` is the only key left out.
- Converted the standalone hand-rolled fetchers to useQuery: `MapManagerPage`,
  `RelationshipManager`, `EventTagger`, `StoragePathInput`. Post-mutation
  `loadX()` reloads became `refetch()`.
- **Bug fixed:** `StoragePathInput` rendered a raw Error object as a React child
  (would crash the browse modal); now `error.message`.

## 6a — useChildRowManager

The plan called for a `<ChildRowManager>` component, but the three managers
(`SessionEventManager`, `QuestObjectiveManager`, `EncounterManager`) share only
their CRUD/draft plumbing — their forms and view rows are entirely different. A
component would have to smuggle that divergent JSX back through render props, worse
than the duplication. So it's a **hook**, `useChildRowManager`, capturing
fetch/draft/edit/save/delete; each manager keeps its own markup.

Optimistic drafts (unsaved `new-…` rows) live in local state merged onto the
server list, which is why a plain useQuery conversion wasn't enough for these three
(the list is part cache, part unsaved drafts). ~150 lines of duplicated logic
removed. The `relationships` join field is stripped in SessionEventManager's
`upsertFn`.

## 6c — atlas de-duplication + dependency inversion

- `getCentroid` was defined identically in both the public renderer (MapAreas) and
  the admin editor (EditAreasLayer); moved to the shared `atlas/utils/pathUtils`.
- **Latent bug fixed:** the area fill pattern id was built by hand in THREE places
  (PatternDefs, MapAreas, EditAreasLayer) and had to match exactly or the
  `url(#id)` fill silently missed its `<pattern>` def. The base opacity default had
  already drifted (0.3 in the public renderer vs 0.2 in the registrar), so
  hatch/dot areas with no explicit opacity rendered unfilled on the public map.
  Extracted to one `getAreaPatternId` in `atlas/utils/areaPattern.js`.
- **Dependency inversions removed:** public code imported from the admin feature —
  `MapAreas` → `PatternDefs`, `EntityMiniMap` → `atlasMapper`. Both moved into the
  shared `atlas/` feature; admin now imports from there. No public→admin imports
  remain (verified by grep).
- Pure helpers kept in their own non-component files so the react-refresh rule
  stays satisfied without exemptions.

Verified after every slice: lint 0/0, build passes, check:imports passes, and the
user click-tested each write path (relationships, entity save, atlas, storage
browse, session events, quest objectives, encounter actions) in the running app.

## Deferred (unchanged, working)

- 6d — the 35 alert()/confirm() calls. Native and functional; replacing them is a
  UX change touching every file with the lowest structural value, so left as-is by
  choice.

---

# Phase 9 — folder structure + duplication

## Structure moves

- `src/dev_helpers/` (4 MB, 100 one-off migration/split files, imported by nothing)
  → `tools/dev_helpers/`, out of the source tree. eslint ignore updated
  (`src/dev_helpers/**` → `tools/**`).
- `src/dev_helpers/sql/*.sql` → `db/migrations/` (they're real DB fixes).
- `src/todo.md` → `TODO.md` at repo root.
- `admin/components/atlas/services/` → `.../atlas/utils/` (one file; every other
  feature already used `utils/`).
- `admin/components/atlas/` (27 files) → `admin/atlas-editor/`. Kept under admin
  (it's admin-only, user's call) but renamed to avoid the name clash with the
  public `features/atlas/`, and dropped one `components/` nesting level.
  - **Miss:** my boundary scan didn't catch `TacticalMapManager`'s `./atlas/...`
    relative imports (11 of them); check:imports flagged all 11, fixed. The
    react-refresh exemption for AtlasEditorContext also had to follow the new path.

`src/` is now just app/ domain/ features/ shared/ main.jsx.

## Duplication assessment (findings)

The codebase is NOT heavily duplicated — the shared helpers are each defined once.
Only three real duplicates were worth touching, and two "candidates" were left
alone as legitimately-different, not duplication:

- **#1 status colours:** added `getStatusColors()` to statusUtils for the
  emerald/amber/red palette. On inspection only `QuestObjectives` was a true
  fit — `EntityHeader` uses semantic CSS badge classes (different approach) and
  `TooltipCard` deliberately groups `completed` with `dead` as red (different
  semantics). Forcing those through the shared helper would have _changed
  behaviour_, so they were left as-is.
- **#2 map-data parse:** the identical string-or-object JSON.parse/catch block in
  TacticalMapManager and EntityMiniMap → one `parseMapData()` in atlasMapper.
- **#3 draft ids:** `new-${Date.now()}` is now minted once inside
  useChildRowManager; the three makeDraft callbacks no longer repeat it.

Left deliberately: repeated Tailwind class strings (extracting them hurts
readability more than it helps) and same-named local handlers (not duplication).

Verified: lint 0/0, build passes, check:imports passes, Prettier clean.

---

# Phase 10 — DM auth (shared password, out of the bundle)

Goal: let the DM console work on the live site without shipping the password in
the bundle, and switch campaigns from within the console.

## What changed

- `shared/api/dmSession.js` (new) — the one place that knows the runtime DM
  password. Stored in sessionStorage (this tab/session only), never bundled.
- `shared/api/supabaseClient.js` — replaced the baked-in `x-dm-password` header
  (from VITE_DM_PASSWORD) with a custom `fetch` that reads the password from the
  session on every request. Requests before sign-in carry no DM header, so RLS
  treats visitors as read-only.
- `features/admin/pages/DmLogin.jsx` (new) at `/dm/login` — can't validate locally
  (the only real copy is the DB function), so it stores what's typed and confirms
  via `verifyDmPassword()`.
- `campaignService.verifyDmPassword()` — a no-op self-update with `.select()`.
  Wrong password isn't an error under RLS; it just matches zero rows, so the test
  is "did a row come back?", verified against the live DB.
- `app/components/DmGuard.jsx` (new) — redirects `/dm/*` to login when no password
  is in session. UX gate only; the DB is the real gate. Replaced the old `isDev`
  flag, so the console now works in production.
- `AdminLayout` — added an in-sidebar campaign switcher (setCampaignId + shared
  `getCampaigns`; every manager refetches on change) and a real Sign Out that
  clears the session password.
- Removed `VITE_DM_PASSWORD` from `.env`. **Verified the value is absent from the
  built `dist/` bundle.**

## Still shared-secret, not real auth

Appropriate for a solo DM tool. The improvement is that the secret is no longer
public — reading the published code reveals nothing. If multiple editors are ever
needed, Supabase Auth + RLS keyed to the user id is the upgrade path.

## OUTSTANDING (user action, cannot be done from code)

- **Rotate the DB password.** The old one was in the bundle/.env and is burned.
  Run in Supabase SQL editor:
  CREATE OR REPLACE FUNCTION public.check_dm_password()
  RETURNS boolean LANGUAGE plpgsql AS $$
    BEGIN
      RETURN (current_setting('request.headers', true)::json->>'x-dm-password') = 'NEW-PASSWORD';
    END; $$;
  The new value becomes what you type at login.
