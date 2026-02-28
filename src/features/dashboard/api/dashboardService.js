import { supabase } from '@/shared/api/supabaseClient';

export const getDashboardData = async (campaignId) => {
	const [{ data: campaign }, { data: stats }, { data: activeParty }, { data: activeThreads }, { data: sessions }] =
		await Promise.all([
			supabase.from('campaigns').select('*').eq('id', campaignId).single(),
			supabase.from('view_dashboard_stats').select('*').eq('campaign_id', campaignId).single(),
			supabase.from('view_active_party').select('*').eq('campaign_id', campaignId),
			// Use view_active_quests (has objectives) and enrich with description from quests table
			supabase.from('view_active_quests').select('*').eq('campaign_id', campaignId),
			supabase
				.from('view_session_arcs')
				.select('*')
				.eq('campaign_id', campaignId)
				.order('session_number', { ascending: false }),
		]);

	// Enrich quests with descriptions (view_active_quests omits description)
	const enrichedThreads = await enrichQuestDescriptions(activeThreads || []);

	const allSessions = sessions || [];
	const latestSession = allSessions[0];

	// 1. Sort Threads (Quests)
	// Order: Main > Personal > Side, then by Priority
	const sortedThreads = sortThreads(enrichedThreads);

	// 2. Identify Current Arc
	const currentArcId = latestSession?.arc_id;

	// 3. Group Sessions into Arcs
	const arcMap = new Map();

	allSessions.forEach((session) => {
		if (!session.arc_id) return;

		if (!arcMap.has(session.arc_id)) {
			arcMap.set(session.arc_id, {
				id: session.arc_id,
				title: session.arc_title,
				description: session.arc_description,
				order: session.arc_order,
				attributes: session.arc_attributes,
				sessions: [],
			});
		}
		arcMap.get(session.arc_id).sessions.push(session);
	});

	// 4. Format Arcs
	const fullTimeline = Array.from(arcMap.values()).sort((a, b) => (b.order || 0) - (a.order || 0));
	const currentArcData = fullTimeline.find((a) => a.id === currentArcId);
	const otherArcs = fullTimeline.filter((a) => a.id !== currentArcId);

	const counts = {
		sessions: allSessions.length,
		arcs: fullTimeline.length,
		quests: sortedThreads.length,
		npcs: stats?.unique_npcs || 0,
		locations: stats?.unique_locations || 0,
		encounters: stats?.total_encounters || 0,
	};

	return {
		campaign,
		stats,
		activeParty: activeParty || [],
		activeThreads: sortedThreads, // Return the sorted list
		currentArc: {
			data: currentArcData,
			latestSession,
			sessions: currentArcData?.sessions || [],
		},
		otherArcs,
		progression: allSessions,
		counts,
	};
};

// --- Helper: Sorting Logic ---
function sortThreads(quests) {
	// Lower number = Higher importance
	const typeWeights = {
		'main quest': 1,
		'personal quest': 2,
		'side quest': 3,
	};

	const priorityWeights = {
		critical: 1,
		high: 2,
		medium: 3,
		normal: 4,
		low: 5,
	};

	return [...quests].sort((a, b) => {
		const typeA = (a.attributes?.['quest type'] || a.attributes?.type || '').toLowerCase();
		const typeB = (b.attributes?.['quest type'] || b.attributes?.type || '').toLowerCase();

		// 1. Primary Sort: Type
		const wA = typeWeights[typeA] || 4;
		const wB = typeWeights[typeB] || 4;

		if (wA !== wB) return wA - wB;

		// 2. Secondary Sort: Priority
		const prioA = (a.attributes?.priority || '').toLowerCase();
		const prioB = (b.attributes?.priority || '').toLowerCase();

		const pA = priorityWeights[prioA] || 4;
		const pB = priorityWeights[prioB] || 4;

		return pA - pB;
	});
}

// --- Helper: Enrich quests with descriptions ---
async function enrichQuestDescriptions(quests) {
	if (quests.length === 0) return quests;

	const ids = quests.map((q) => q.id);
	const { data: descriptions } = await supabase
		.from('quests')
		.select('id, description')
		.in('id', ids);

	if (!descriptions) return quests;

	const descMap = new Map(descriptions.map((d) => [d.id, d.description]));
	return quests.map((q) => ({ ...q, description: descMap.get(q.id) || null }));
}
