/**
 * Style rules extracted from the user's own writing.
 *
 * Derived from four real samples (two NPC descriptions, one location, one
 * timeline event) plus a session narrative excerpt. Measured properties:
 *
 *   sample                words  sentences  avg/sent  em-dashes  opening
 *   npc (Loïc)               90      4         23         2      noun phrase
 *   location (birthplace)    47      3         16         0      noun phrase
 *   timeline event           79      3         26         0      noun phrase
 *   npc (lich, detailed)    199      8         25         3      noun phrase
 *
 * The single most distinctive rule: NOT ONE opens with "X is a…". Every sample
 * begins with a bare noun phrase ("A magnificent Phoenix who…", "An archdruid
 * who became a lich,…", "Kaedin's birthplace, a mining village…"). Small models
 * default to "X is a…" constantly, so this is stated first and hardest.
 */

/** Few-shot examples. Real user text — do not paraphrase these. */
export const STYLE_EXAMPLES = {
	npc: [
		`A magnificent Phoenix who resides in Avarthel's Grove, serving as its eternal guardian spirit. His plumage glows with the shifting colors of sunrise—golds, deep reds, and vibrant oranges—and he radiates a gentle, comforting warmth that suppresses fear and pain. When the party brought the delirious and injured barmaid Anya to the grove, Loïc descended from the canopy and shed healing tears upon her wounds. These tears stabilized her condition and purged the madness from her mind before the Druid arrived, demonstrating that the grove's power is actively benevolent and sentient.`,
		`An archdruid who became a lich, wearing an amulet of Silvanus at his throat. The thing that was once his body now serves as little more than the anchor for a will that refused to stop. He commands an army of ten thousand undead troops drilling in the open savanna south of Pahuax—shield walls braced against imaginary aerial attackers, war machines firing at practice targets, flanking formations moving in silence. His century-long war against Deskari's forces has been a stalemate, but the party's destruction of the Idol of Lamashtu has finally allowed his army to advance.`,
	],
	location: [
		`Kaedin's birthplace, a mining village carved into the rugged ridges of the Earthspur Mountains near the Great Rift. The land is steeped in elemental magic from an ancient Dao genie pact with mountain dwarves. Site of the tunnel where Kaedin and Thalos discovered the Kryn Dynasty beacon.`,
	],
	event: [
		`Under the compulsion of Olek's Zone of Truth spell, the captured hobgoblin provides limited but valuable information. He speaks of Wyrmlord Koth, a powerful sorcerer who is gathering various tribes for something called "the Day of Ruin." When shown a symbol depicting a sun with a red hand, the hobgoblin clearly recognizes it but steadfastly refuses to reveal the location of the raiders' base. True to his word, Olek honors his promise and grants the prisoner a swift death.`,
	],
};

/** Target lengths, measured from the samples. */
export const LENGTH_TARGETS = {
	npc: { words: '60-120', sentences: '3-5' },
	location: { words: '40-70', sentences: '2-4' },
	faction: { words: '50-100', sentences: '3-4' },
	quest: { words: '40-80', sentences: '2-4' },
	item: { words: '30-60', sentences: '2-3' },
	encounter: { words: '50-90', sentences: '3-4' },
	event: { words: '60-90', sentences: '3-4' },
};

const RULES = `VOICE RULES (follow exactly)

1. NEVER open with "X is a…" or "X was a…". Open with a bare noun phrase.
     yes: "A magnificent Phoenix who resides in Avarthel's Grove…"
     yes: "An archdruid who became a lich, wearing an amulet of Silvanus…"
     yes: "Kaedin's birthplace, a mining village carved into…"
     no:  "Loïc is a phoenix who lives in the grove."
     no:  "This location is a mining village."

2. Concrete physical detail over adjectives. Name specific things — colours,
   materials, objects, numbers. Not "an impressive army" but "ten thousand
   undead troops drilling in the open savanna".

3. Present tense for what is still true. Past tense only for completed events.

4. Sentences average 20-26 words. Vary the length; do not write a list of
   uniform short sentences.

5. Em-dashes (—) introduce a concrete elaboration of what precedes them:
     "the shifting colors of sunrise—golds, deep reds, and vibrant oranges"
     "drilling in the open savanna south of Pahuax—shield walls braced against
      imaginary aerial attackers, war machines firing at practice targets"
   Use at most one or two. Never as a substitute for a comma.

6. State facts flatly, without editorialising. No "remarkably", "truly",
   "it should be noted". Let the detail carry the weight.

7. Reference the party and named characters directly: "the party brought the
   delirious and injured barmaid Anya to the grove".

8. Consequence closes a description where one exists: what changed, what it
   means now. "…has finally allowed his army to advance."

FORBIDDEN
  - Opening with a definition of the entity's category.
  - "In summary", "Overall", "This entry describes".
  - Speculation: "may have", "it is possible that", "perhaps".
  - Second person, or addressing the reader.
  - Restating the entity's name and type as the first clause.`;

/**
 * Build the style block for a prompt.
 * @param {string} kind  entity type, or 'event'
 */
export function styleBlock(kind) {
	const examples = STYLE_EXAMPLES[kind] || STYLE_EXAMPLES.npc;
	const target = LENGTH_TARGETS[kind] || LENGTH_TARGETS.npc;
	const shown = examples.map((e, i) => `EXAMPLE ${i + 1} (${e.split(/\s+/).length} words):\n${e}`).join('\n\n');

	return `${RULES}

TARGET LENGTH: ${target.words} words, ${target.sentences} sentences.

Study these. They are the target voice — written by the campaign's author.

${shown}`;
}
