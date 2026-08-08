/**
 * The 21 relationship types, written so a model can actually apply them.
 *
 * This file IS the experiment. If pass C fails, the fix is almost always here
 * (sharper definitions / better negative examples), not in the script.
 *
 * Design notes:
 *  - Every entry has an explicit `not` clause. Most classification errors are
 *    confusions between neighbouring types, so the boundary matters more than
 *    the definition.
 *  - NONE is listed as a real option and the prompt biases toward it. This is
 *    the defence against "mentioned in the same paragraph" becoming a link.
 */

export const RELATIONSHIP_TYPES = [
	'member_of',
	'leadership_relation',
	'part_of',
	'affiliated_with',
	'family_relation',
	'romantic_relation',
	'professional_relation',
	'located_in',
	'parent_location',
	'residence_relation',
	'workplace_relation',
	'ownership_relation',
	'quest_giver',
	'quest_objective',
	'quest_update',
	'quest_participant',
	'quest_location',
	'hostile_to',
	'knowledge_of',
	'encountered',
];

/** Canonical definitions with boundaries and worked examples. */
export const VOCABULARY = [
	{
		type: 'member_of',
		when: 'A belongs to the organisation/faction B as a rank-and-file member.',
		not: 'Do not use if A leads B (use leadership_relation) or is merely sympathetic (affiliated_with).',
		example: '"Tharos wears the red sash of the Brotherhood." → npc member_of faction',
	},
	{
		type: 'leadership_relation',
		when: 'A commands, rules, or leads B (a faction, settlement, or group).',
		not: 'Do not use for ordinary membership, or for owning an object.',
		example: '"Captain Soranna commands the garrison." → npc leadership_relation faction/location',
	},
	{
		type: 'part_of',
		when: 'A is structurally a component of B. Used for sessions belonging to a narrative arc, or a sub-group within a larger body.',
		not: 'For geography use parent_location. For people in organisations use member_of.',
		example: '"Session 12 concludes the Witchwood arc." → session part_of narrative_arc',
	},
	{
		type: 'affiliated_with',
		when: 'A is loosely connected to B — sympathiser, ally, contact — without formal membership.',
		not: 'If formal membership is stated, prefer member_of. This is the weaker, vaguer option.',
		example: '"He does occasional work for the Thieves\' Guild." → npc affiliated_with faction',
	},
	{
		type: 'family_relation',
		when: 'A and B are related by blood or marriage.',
		not: 'Not for close friendship (no type needed) or romance (romantic_relation).',
		example: '"Bonnie\'s brother Norr." → npc family_relation npc',
	},
	{
		type: 'romantic_relation',
		when: 'A and B are romantically involved, current or former.',
		not: 'Not for flirtation in passing, or platonic closeness.',
		example: '"They had been lovers before the war." → npc romantic_relation npc',
	},
	{
		type: 'professional_relation',
		when: 'A and B have a working relationship — colleagues, employer/employee, mentor/apprentice, trade partners.',
		not: 'Not for a one-off transaction. Implies an ongoing relationship.',
		example: '"Olek has trained under the smith for years." → npc professional_relation npc',
	},
	{
		type: 'located_in',
		when: 'A is CURRENTLY physically present at location B, as of this session.',
		not: 'CRITICAL: not for somewhere A merely visited, passed through, or was mentioned near. If A lives there use residence_relation; if A only met the party there once use encountered. Prefer NONE when presence is incidental.',
		example: '"The wounded scout is resting in the temple." → npc located_in location',
	},
	{
		type: 'parent_location',
		when: 'A is geographically contained within location B. Both A and B MUST be locations.',
		not: 'Never use when A is a person, item, or faction. Direction matters: A is the child, B is the container.',
		example: '"Drellin\'s Ferry, westernmost town of the Elsir Vale." → location(Ferry) parent_location location(Vale)',
	},
	{
		type: 'residence_relation',
		when: "B is A's home or dwelling — persistent, not situational.",
		not: 'Not for a place A is temporarily staying, and not for a workplace (workplace_relation).',
		example: '"Soranna has lived in the Ferry for twelve years." → npc residence_relation location',
	},
	{
		type: 'workplace_relation',
		when: 'B is where A works or holds a post.',
		not: 'Not their home, unless the text says both (then emit both relationships).',
		example: '"Avarthel tends the grove shrine." → npc workplace_relation location',
	},
	{
		type: 'ownership_relation',
		when: 'A owns or possesses B — typically an item, occasionally property.',
		not: 'Not for something A merely carried or used once.',
		example: '"The staff has been Veilbranch\'s for generations." → npc ownership_relation item',
	},
	{
		type: 'quest_giver',
		when: 'A assigned, offered, or requested quest B.',
		not: 'Not for someone who merely mentioned the quest exists.',
		example: '"Soranna asks the party to scout the bridge." → npc quest_giver quest',
	},
	{
		type: 'quest_objective',
		when: 'B is a target/goal of quest A. Links a quest to the entity that must be found, killed, retrieved, or protected.',
		not: "Not the quest's location (quest_location) or its giver (quest_giver).",
		example: '"They must recover the Amulet of Mualthar." → quest quest_objective item',
	},
	{
		type: 'quest_update',
		when: 'Links a quest to a session or event that advanced it.',
		not: 'Not for quest completion by a character (quest_participant).',
		example: '"This session the party learned the bridge was already lost." → quest quest_update session',
	},
	{
		type: 'quest_participant',
		when: 'A (usually a player character) is actively pursuing quest B.',
		not: 'Not the giver. Not someone who merely knows of it (knowledge_of).',
		example: '"Kaedin swore to see it done." → character quest_participant quest',
	},
	{
		type: 'quest_location',
		when: 'Quest A takes place at, or centres on, location B.',
		not: 'Not somewhere the quest was merely discussed.',
		example: '"The hydra must be driven from the swamp." → quest quest_location location',
	},
	{
		type: 'hostile_to',
		when: 'A is actively opposed to B — enemies, at war, in open conflict.',
		not: 'Not mild dislike or a single argument. Implies sustained opposition.',
		example: '"The Red Hand has sworn to burn the Vale." → faction hostile_to location/faction',
	},
	{
		type: 'knowledge_of',
		when: 'A knows about B — a secret, a rumour, a place, a person — without a stronger relationship applying.',
		not: 'Use only when the knowledge itself is narratively significant. Otherwise NONE.',
		example: '"Only Yoghurt knows where the passage lies." → npc knowledge_of location',
	},
	{
		type: 'encountered',
		when: 'A and B met, once, at a specific point. The default for "the party met this NPC here".',
		not: 'If a persistent relationship is stated, prefer the specific type. This is the weak, one-off option.',
		example: '"They spoke briefly with a fisherman at the docks." → character encountered npc',
	},
];

/** Renders the vocabulary block for the prompt. Identical every call, so Ollama's prefix cache handles it. */
export function renderVocabulary() {
	return VOCABULARY.map(
		(v) => `- ${v.type}\n    USE WHEN: ${v.when}\n    DO NOT: ${v.not}\n    EXAMPLE: ${v.example}`
	).join('\n');
}
