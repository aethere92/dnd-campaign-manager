/**
 * Which relationship types are even POSSIBLE for a given pair of entity types.
 *
 * This is the single biggest accuracy lever, and it needs no model at all.
 * Test run 1 asked the model to pick from 21 types for every pair and got the
 * type right 2/12 times. Most of those errors were structurally impossible —
 * e.g. proposing `parent_location` between an npc and a location, which cannot
 * be valid by definition.
 *
 * Restricting the enum per pair turns a 21-way choice into a 2-5 way choice.
 */

/** Unordered key so npc|location and location|npc share one rule. */
const key = (a, b) => [a, b].sort().join('|');

const RULES = {
	// --- geography -------------------------------------------------------
	[key('location', 'location')]: ['parent_location'],

	// --- people to places ------------------------------------------------
	[key('npc', 'location')]: ['residence_relation', 'workplace_relation', 'located_in', 'encountered'],
	[key('character', 'location')]: ['residence_relation', 'located_in', 'encountered'],

	// --- people to people ------------------------------------------------
	[key('npc', 'npc')]: [
		'family_relation',
		'romantic_relation',
		'professional_relation',
		'hostile_to',
		'leadership_relation',
	],
	[key('character', 'npc')]: [
		'family_relation',
		'romantic_relation',
		'professional_relation',
		'hostile_to',
		'encountered',
	],
	[key('character', 'character')]: ['family_relation', 'romantic_relation', 'professional_relation'],

	// --- people to organisations -----------------------------------------
	[key('npc', 'faction')]: ['leadership_relation', 'member_of', 'affiliated_with', 'hostile_to'],
	[key('character', 'faction')]: ['member_of', 'affiliated_with', 'hostile_to'],

	// --- organisations ---------------------------------------------------
	[key('faction', 'faction')]: ['hostile_to', 'affiliated_with', 'part_of'],
	[key('faction', 'location')]: ['located_in', 'hostile_to', 'ownership_relation'],

	// --- items -----------------------------------------------------------
	[key('npc', 'item')]: ['ownership_relation'],
	[key('character', 'item')]: ['ownership_relation'],
	[key('faction', 'item')]: ['ownership_relation'],
	[key('item', 'location')]: ['located_in'],

	// --- quests ----------------------------------------------------------
	[key('quest', 'npc')]: ['quest_giver', 'quest_objective', 'quest_participant'],
	[key('quest', 'character')]: ['quest_participant'],
	[key('quest', 'location')]: ['quest_location', 'quest_objective'],
	[key('quest', 'item')]: ['quest_objective'],
	[key('quest', 'faction')]: ['quest_objective', 'quest_giver'],
	[key('quest', 'session')]: ['quest_update'],
	[key('quest', 'quest')]: ['part_of'],

	// --- encounters ------------------------------------------------------
	[key('encounter', 'location')]: ['located_in'],
	[key('encounter', 'npc')]: ['quest_objective'],
	[key('encounter', 'session')]: ['part_of'],

	// --- sessions / arcs -------------------------------------------------
	[key('session', 'narrative_arc')]: ['part_of'],
};

/**
 * Allowed types for a pair. Empty array = this combination cannot have a
 * relationship, so skip the model entirely (free accuracy, zero cost).
 */
export function allowedTypes(typeA, typeB) {
	return RULES[key((typeA || '').toLowerCase(), (typeB || '').toLowerCase())] || [];
}

/**
 * Short definitions, used only for the types actually offered on a given call.
 * Deliberately terse — the previous version sent ~1400 tokens of vocabulary on
 * every request, which both slowed things down and buried the decision.
 */
export const SHORT_DEFS = {
	parent_location: 'A is geographically INSIDE B (A is the smaller/contained place)',
	residence_relation: "B is A's home — permanent dwelling",
	workplace_relation: 'B is where A works or holds a post',
	located_in: 'A is currently physically at B, this session',
	encountered: 'A and B simply met here once — no lasting tie',
	family_relation: 'blood or marriage',
	romantic_relation: 'romantic partners, current or past',
	professional_relation: 'ongoing working relationship, colleagues, mentor/apprentice',
	hostile_to: 'active sustained enmity',
	leadership_relation: 'A commands or rules B',
	member_of: 'A is a formal member of organisation B',
	affiliated_with: 'A is loosely connected to B, not a formal member',
	part_of: 'A is structurally a component of B',
	ownership_relation: 'A owns or possesses B',
	quest_giver: 'A assigned quest B',
	quest_objective: 'B is a goal/target of quest A',
	quest_participant: 'A is actively pursuing quest B',
	quest_location: 'quest A happens at B',
	quest_update: 'session/event B advanced quest A',
	knowledge_of: 'A knows a significant secret about B',
};
