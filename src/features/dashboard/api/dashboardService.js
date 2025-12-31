import { supabase } from '@/shared/api/supabaseClient';
import { getAttributeValue, parseAttributes } from '@/domain/entity/utils/attributeParser';

/**
 * Fetch comprehensive dashboard data
 */
export const getDashboardData = async (campaignId) => {
	// 1. Fetch Campaign Info
	const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();

	// 2. Fetch Sessions with Events (Get ALL sessions, we'll sort by session_number later)
	const { data: sessions, error: sessionError } = await supabase
		.from('sessions')
		.select(
			`
            id, 
            title, 
            narrative,
            created_at,
            events:session_events (
                id, 
                title, 
                description, 
                event_type, 
                event_order
            )
        `
		)
		.eq('campaign_id', campaignId);

	if (sessionError) throw sessionError;
	if (!sessions || sessions.length === 0) {
		return { campaign, sessions: [], stats: {}, activeQuests: [], recentEncounters: [] };
	}

	// 3. Fetch Attributes for Sessions
	const sessionIds = sessions.map((s) => s.id);
	const { data: attributes } = await supabase
		.from('attributes')
		.select('entity_id, name, value')
		.in('entity_id', sessionIds);

	const attrMap = new Map();
	(attributes || []).forEach((attr) => {
		if (!attrMap.has(attr.entity_id)) attrMap.set(attr.entity_id, []);
		attrMap.get(attr.entity_id).push(attr);
	});

	// 4. Process Sessions with Attributes
	const processedSessions = sessions.map((s) => {
		const rawAttrs = attrMap.get(s.id) || [];
		const attrs = rawAttrs.reduce((acc, c) => {
			acc[c.name] = c.value;
			return acc;
		}, {});

		const num = getAttributeValue(attrs, ['session_number', 'Session']) || 999;
		const date = getAttributeValue(attrs, ['session_date', 'Date']) || '';
		const summary = getAttributeValue(attrs, 'Summary');

		return {
			...s,
			name: s.title,
			session_number: Number(num),
			session_date: date,
			description: summary || s.narrative?.substring(0, 200) || '',
			attributes: attrs,
			events: (s.events || []).sort((a, b) => (a.event_order || 0) - (b.event_order || 0)),
		};
	});

	// Sort by session_number DESC to get proper latest session
	processedSessions.sort((a, b) => b.session_number - a.session_number);

	// Take only the 10 most recent for display
	const recentSessions = processedSessions.slice(0, 10);

	// 5. Fetch Event Relationships (for tags/mentions)
	const allEvents = recentSessions.flatMap((s) => s.events);
	const eventIds = allEvents.map((e) => e.id);

	if (eventIds.length > 0) {
		const { data: relationships } = await supabase
			.from('entity_relationships')
			.select(`from_entity_id, target:entities!to_entity_id ( id, name, type )`)
			.in('from_entity_id', eventIds);

		const relMap = new Map();
		(relationships || []).forEach((rel) => {
			if (!relMap.has(rel.from_entity_id)) relMap.set(rel.from_entity_id, []);
			relMap.get(rel.from_entity_id).push(rel);
		});

		recentSessions.forEach((session) => {
			session.events.forEach((event) => {
				event.relationships = relMap.get(event.id) || [];
			});
		});
	}

	// 6. Fetch Direct Session Relationships (only for recent sessions)
	const recentSessionIds = recentSessions.map((s) => s.id);
	const { data: sessionRels } = await supabase
		.from('entity_relationships')
		.select(`from_entity_id, target:entities!to_entity_id ( id, name, type )`)
		.in('from_entity_id', recentSessionIds);

	const sessionRelMap = new Map();
	(sessionRels || []).forEach((rel) => {
		if (!sessionRelMap.has(rel.from_entity_id)) sessionRelMap.set(rel.from_entity_id, []);
		sessionRelMap.get(rel.from_entity_id).push(rel.target);
	});

	// 7. Extract Mentions by Type
	recentSessions.forEach((session) => {
		const mentionsMap = new Map();

		// Add direct session relationships
		const directRels = sessionRelMap.get(session.id) || [];
		directRels.forEach((target) => {
			if (!target) return;
			mentionsMap.set(target.id, {
				id: target.id,
				name: target.name,
				type: target.type,
			});
		});

		// Add event relationships
		session.events.forEach((evt) => {
			if (evt.relationships) {
				evt.relationships.forEach((rel) => {
					if (!rel.target) return;
					mentionsMap.set(rel.target.id, {
						id: rel.target.id,
						name: rel.target.name,
						type: rel.target.type,
					});
				});
			}
		});

		// Group by type
		const groups = {};
		mentionsMap.forEach((item) => {
			const type = item.type?.toLowerCase() || 'other';
			if (!groups[type]) groups[type] = [];
			groups[type].push(item);
		});

		// Sort each group alphabetically
		Object.keys(groups).forEach((key) => {
			groups[key].sort((a, b) => a.name.localeCompare(b.name));
		});

		session.mentions = groups;
	});

	// 8. **FIX: Fetch ALL quests with their attributes properly**
	const { data: allQuestsRaw } = await supabase
		.from('entities')
		.select('id, name')
		.eq('campaign_id', campaignId)
		.eq('type', 'quest')
		.order('name');

	// Fetch attributes for all quests
	let questAttributes = [];
	if (allQuestsRaw && allQuestsRaw.length > 0) {
		const questIds = allQuestsRaw.map((q) => q.id);
		const { data: attrs } = await supabase
			.from('attributes')
			.select('entity_id, name, value')
			.in('entity_id', questIds);
		questAttributes = attrs || [];
	}

	// Map attributes to quests
	const questAttrMap = new Map();
	questAttributes.forEach((attr) => {
		if (!questAttrMap.has(attr.entity_id)) questAttrMap.set(attr.entity_id, []);
		questAttrMap.get(attr.entity_id).push(attr);
	});

	// Process quests with parsed attributes
	const allQuests = (allQuestsRaw || []).map((q) => {
		const rawAttrs = questAttrMap.get(q.id) || [];
		const attrs = parseAttributes(rawAttrs); // Convert array to object
		return {
			...q,
			attributes: attrs,
			rawAttributes: rawAttrs, // Keep raw for potential debugging
		};
	});

	// Fetch objectives for active quests (for display widget)
	const activeQuests = allQuests.filter((q) => {
		const status = getAttributeValue(q.attributes, ['status', 'Status', 'quest status', 'Quest Status']) || '';
		const statusLower = status.toLowerCase();
		return (
			statusLower.includes('active') ||
			statusLower.includes('in progress') ||
			statusLower.includes('progress') ||
			statusLower === '' ||
			statusLower === 'pending'
		);
	});

	// Fetch objectives for the active quests we'll display
	const displayQuestIds = activeQuests.slice(0, 5).map((q) => q.id);
	let questObjectives = [];
	if (displayQuestIds.length > 0) {
		const { data: objectives } = await supabase
			.from('quest_objectives')
			.select('*')
			.in('quest_id', displayQuestIds)
			.order('order_index', { ascending: true });
		questObjectives = objectives || [];
	}

	// Attach objectives to quests
	const displayedActiveQuests = activeQuests.slice(0, 5).map((q) => ({
		...q,
		objectives: questObjectives.filter((obj) => obj.quest_id === q.id),
	}));

	// **FIX: Count completed quests with proper attribute parsing**
	const completedQuestsCount = allQuests.filter((q) => {
		const status = getAttributeValue(q.attributes, ['status', 'Status', 'quest status', 'Quest Status']) || '';
		const statusLower = status.toLowerCase();
		return (
			statusLower.includes('complete') ||
			statusLower.includes('finish') ||
			statusLower.includes('done') ||
			statusLower.includes('success')
		);
	}).length;

	// 9. Fetch Recent Encounters with Session Info
	const { data: recentEncounters } = await supabase
		.from('entities')
		.select('id, name, created_at')
		.eq('campaign_id', campaignId)
		.eq('type', 'encounter')
		.order('created_at', { ascending: false });
	// .limit(5);

	// Attach session info to encounters via relationships
	if (recentEncounters && recentEncounters.length > 0) {
		const encounterIds = recentEncounters.map((e) => e.id);

		const { data: encounterRels } = await supabase
			.from('entity_relationships')
			.select(`from_entity_id, target:entities!to_entity_id ( id, name, type )`)
			.in('from_entity_id', encounterIds)
			.eq('entities.type', 'session');

		const encounterSessionMap = new Map();
		(encounterRels || []).forEach((rel) => {
			if (rel.target && rel.target.type === 'session') {
				encounterSessionMap.set(rel.from_entity_id, rel.target);
			}
		});

		// Fetch session numbers for those sessions
		const encounterSessionIds = Array.from(encounterSessionMap.values()).map((s) => s.id);
		if (encounterSessionIds.length > 0) {
			const { data: sessionAttrs } = await supabase
				.from('attributes')
				.select('entity_id, value')
				.in('entity_id', encounterSessionIds)
				.or('name.eq.session_number,name.eq.Session');

			const sessionNumMap = new Map();
			(sessionAttrs || []).forEach((a) => sessionNumMap.set(a.entity_id, a.value));

			encounterSessionMap.forEach((session) => {
				session.session_number = sessionNumMap.get(session.id);
			});
		}

		// Attach to encounters
		recentEncounters.forEach((enc) => {
			enc.session = encounterSessionMap.get(enc.id) || null;
		});
	}

	// 10. Calculate Stats
	const stats = {
		totalSessions: processedSessions.length,
		totalEncounters: recentEncounters?.length || 0,
		uniqueNPCs: 0,
		uniqueLocations: 0,
		completedQuests: completedQuestsCount,
		activeQuests: activeQuests.length,
		mostActiveSession: null,
		topLocation: null,
		topNPC: null,
	};

	// Count unique entities across recent sessions
	const npcSet = new Set();
	const locationSet = new Set();
	let maxEvents = 0;
	let mostActiveSession = null;

	recentSessions.forEach((session) => {
		// Track most active session
		if (session.events.length > maxEvents) {
			maxEvents = session.events.length;
			mostActiveSession = {
				id: session.id,
				title: session.title,
				eventCount: session.events.length,
			};
		}

		// Count unique entities
		if (session.mentions) {
			(session.mentions.npc || []).forEach((npc) => npcSet.add(npc.id));
			(session.mentions.location || []).forEach((loc) => locationSet.add(loc.id));
		}
	});

	stats.uniqueNPCs = npcSet.size;
	stats.uniqueLocations = locationSet.size;
	stats.mostActiveSession = mostActiveSession;

	// Find most mentioned NPC/Location
	const npcMentions = new Map();
	const locationMentions = new Map();

	recentSessions.forEach((session) => {
		if (session.mentions) {
			(session.mentions.npc || []).forEach((npc) => {
				npcMentions.set(npc.id, {
					name: npc.name,
					count: (npcMentions.get(npc.id)?.count || 0) + 1,
				});
			});
			(session.mentions.location || []).forEach((loc) => {
				locationMentions.set(loc.id, {
					name: loc.name,
					count: (locationMentions.get(loc.id)?.count || 0) + 1,
				});
			});
		}
	});

	// Get top NPC
	let topNPC = { name: 'None', mentions: 0 };
	npcMentions.forEach((data) => {
		if (data.count > topNPC.mentions) {
			topNPC = { name: data.name, mentions: data.count };
		}
	});
	stats.topNPC = topNPC;

	// Get top Location
	let topLocation = { name: 'None', visits: 0 };
	locationMentions.forEach((data) => {
		if (data.count > topLocation.visits) {
			topLocation = { name: data.name, visits: data.count };
		}
	});
	stats.topLocation = topLocation;

	// 11. Return Complete Dashboard Data
	return {
		campaign,
		sessions: recentSessions,
		stats,
		activeQuests: displayedActiveQuests,
		recentEncounters: recentEncounters.slice(0, 5) || [],
	};
};
