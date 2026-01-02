import { supabase } from '@/shared/api/supabaseClient';
import { getStrategy } from '@/features/admin/config/adminStrategies';

/**
 * Helper to determine which column stores JSON attributes.
 * Campaigns use 'metadata', others use 'attributes'.
 */
const getAttrColumn = (type) => (type === 'campaign' ? 'metadata' : 'attributes');

export const createEntity = async (type, data) => {
	const strategy = getStrategy(type);
	const attrCol = getAttrColumn(type);

	// 1. Prepare Core Payload
	const corePayload = {};

	// Parent ID logic
	if (type !== 'campaign' && data.campaign_id) {
		corePayload.campaign_id = data.campaign_id;
	}

	// Name/Desc Mapping
	if (strategy.colMapping) {
		if (data.name) corePayload[strategy.colMapping.name] = data.name;
		if (data.description) corePayload[strategy.colMapping.description] = data.description;
	}

	// Entity Type Discriminator
	if (strategy.primaryTable === 'entities') corePayload.type = type;

	// 2. Process Attributes -> JSONB
	// We merge explicit form attributes with the 'attributesList' array from the UI
	const rawAttributes =
		data.attributesList ||
		(data.attributes ? Object.entries(data.attributes).map(([k, v]) => ({ name: k, value: v })) : []);

	const jsonStorage = {};

	rawAttributes.forEach((attr) => {
		// If the strategy says this attribute is actually a top-level column (like 'map_data'), extract it.
		// Otherwise, put it in the JSON blob.
		const isSpecialColumn = strategy.defaultAttributes?.find((def) => def.key === attr.name && type === 'campaign');

		if (isSpecialColumn) {
			corePayload[attr.name] = attr.value;
		} else {
			jsonStorage[attr.name] = attr.value;
		}
	});

	// Assign the JSON blob to the correct column
	corePayload[attrCol] = jsonStorage;

	console.log('[Admin] Creating DB Optimized:', corePayload);

	// 3. Insert Single Row (No secondary table inserts needed)
	const { data: insertedRecord, error: insertError } = await supabase
		.from(strategy.primaryTable)
		.insert(corePayload)
		.select()
		.single();

	if (insertError) throw insertError;

	return insertedRecord;
};

export const updateEntity = async (type, id, data) => {
	const strategy = getStrategy(type);
	const attrCol = getAttrColumn(type);

	// 1. Prepare Core Payload
	const corePayload = {};
	if (strategy.colMapping) {
		if (data.name) corePayload[strategy.colMapping.name] = data.name;
		if (data.description) corePayload[strategy.colMapping.description] = data.description;
	}

	// 2. Process Attributes -> JSONB
	const rawAttributes =
		data.attributesList ||
		(data.attributes ? Object.entries(data.attributes).map(([k, v]) => ({ name: k, value: v })) : []);

	const jsonStorage = {};

	rawAttributes.forEach((attr) => {
		const isSpecialColumn = strategy.defaultAttributes?.find((def) => def.key === attr.name && type === 'campaign');

		if (isSpecialColumn) {
			corePayload[attr.name] = attr.value;
		} else {
			jsonStorage[attr.name] = attr.value;
		}
	});

	// Overwrite the JSON column completely (Single Source of Truth)
	corePayload[attrCol] = jsonStorage;

	// 3. Update Row
	const { error: updateError } = await supabase.from(strategy.primaryTable).update(corePayload).eq('id', id);

	if (updateError) throw updateError;
	return { success: true };
};

export const fetchRawEntity = async (type, id) => {
	const strategy = getStrategy(type);
	const attrCol = getAttrColumn(type);

	// 1. Fetch Core Data AND the JSON column in one shot
	const { data: coreData, error: coreError } = await supabase
		.from(strategy.primaryTable)
		.select('*')
		.eq('id', id)
		.single();

	if (coreError) throw coreError;

	// 2. Transform DB Columns to Form Data
	const formData = { ...coreData };
	if (strategy.colMapping) {
		Object.entries(strategy.colMapping).forEach(([formField, dbCol]) => {
			if (coreData[dbCol] !== undefined) {
				formData[formField] = coreData[dbCol];
			}
		});
	}

	// 3. Transform JSONB -> Attribute List Array
	// This maintains compatibility with the Generic Admin Forms
	const attributesList = [];
	const jsonSource = coreData[attrCol] || {};

	// A. Add JSON attributes
	Object.entries(jsonSource).forEach(([key, value]) => {
		attributesList.push({ name: key, value: value });
	});

	// B. Add "Pseudo-Attributes" (Columns that look like attributes in the UI)
	if (strategy.defaultAttributes) {
		strategy.defaultAttributes.forEach((defAttr) => {
			// If it's a real column on the table (not in JSON), add it to list
			if (coreData[defAttr.key] !== undefined && !jsonSource[defAttr.key]) {
				attributesList.push({
					name: defAttr.key,
					value: coreData[defAttr.key],
				});
			}
		});
	}

	return { ...formData, attributesList };
};

/**
 * Fetch all relationships for a specific entity
 */
export const fetchRelationships = async (id) => {
	const { data, error } = await supabase
		.from('entity_relationships')
		.select(
			`
            id,
            relationship_type,
            description,
            is_bidirectional,
            is_hidden,
            target:entities!to_entity_id ( id, name, type )
        `
		)
		.eq('from_entity_id', id);

	if (error) throw error;
	return data;
};

export const addRelationship = async (payload) => {
	const { data, error } = await supabase.from('entity_relationships').insert(payload).select().single();
	if (error) throw error;
	return data;
};

export const deleteRelationship = async (relId) => {
	const { error } = await supabase.from('entity_relationships').delete().eq('id', relId);
	if (error) throw error;
	return true;
};

export const fetchChildRows = async (table, foreignKeyCol, parentId, orderBy = 'id') => {
	const { data, error } = await supabase
		.from(table)
		.select('*')
		.eq(foreignKeyCol, parentId)
		.order(orderBy, { ascending: true });
	if (error) throw error;
	return data;
};

export const upsertSessionEvent = async (eventData) => {
	const payload = { ...eventData };
	if (String(payload.id).startsWith('new')) delete payload.id;
	const { data, error } = await supabase.from('session_events').upsert(payload).select().single();
	if (error) throw error;
	return data;
};

export const deleteRow = async (table, id) => {
	const { error } = await supabase.from(table).delete().eq('id', id);
	if (error) throw error;
	return true;
};

export const upsertQuestObjective = async (objectiveData) => {
	const payload = { ...objectiveData };
	if (String(payload.id).startsWith('new')) delete payload.id;
	const { data, error } = await supabase.from('quest_objectives').upsert(payload).select().single();
	if (error) throw error;
	return data;
};

export const deleteEntity = async (type, id) => {
	const strategy = getStrategy(type);
	// No need to delete from 'attributes' table manually anymore.
	// FK constraints or triggers should handle cleanup,
	// but pure 'delete' is sufficient as attributes are now columns.
	const { error: mainError } = await supabase.from(strategy.primaryTable).delete().eq('id', id);
	if (mainError) throw mainError;
	return true;
};

export const updateRelationship = async (relId, updates) => {
	const { error } = await supabase.from('entity_relationships').update(updates).eq('id', relId);
	if (error) throw error;
	return true;
};

/**
 * REPLACED with Database RPC
 * Performs server-side search of entities and sessions.
 */
export const searchEntitiesByName = async (campaignId, query) => {
	if (!query) return [];

	const { data, error } = await supabase.rpc('api_search_entities', {
		p_campaign_id: campaignId,
		p_search_term: query,
	});

	if (error) {
		console.error('Search RPC failed', error);
		throw error;
	}

	return data || [];
};

export const getSessionList = async (campaignId) => {
	const { data, error } = await supabase
		.from('sessions')
		.select('id, title')
		.eq('campaign_id', campaignId)
		.order('title', { ascending: true });
	if (error) throw error;
	return data;
};

export const fetchSessionEventsWithRelationships = async (sessionId) => {
	const { data: events, error: eventError } = await supabase
		.from('session_events')
		.select('*')
		.eq('session_id', sessionId)
		.order('event_order', { ascending: true });

	if (eventError) throw eventError;
	if (!events || events.length === 0) return [];

	const eventIds = events.map((e) => e.id);
	const { data: rels, error: relError } = await supabase
		.from('entity_relationships')
		.select(
			`
            id,
            from_entity_id,
            target:entities!to_entity_id ( id, name, type )
        `
		)
		.in('from_entity_id', eventIds);

	if (relError) throw relError;

	const relMap = {};
	rels.forEach((r) => {
		if (!relMap[r.from_entity_id]) relMap[r.from_entity_id] = [];
		relMap[r.from_entity_id].push(r);
	});

	return events.map((e) => ({
		...e,
		relationships: relMap[e.id] || [],
	}));
};

export const fetchEncounterActions = async (encounterId) => {
	const { data, error } = await supabase
		.from('encounter_actions')
		.select(
			`
			*,
			actor:entities!actor_entity_id(name, type),
			target:entities!target_entity_id(name, type)
		`
		)
		.eq('encounter_id', encounterId)
		.order('round_number', { ascending: true })
		.order('action_order', { ascending: true });
	if (error) throw error;
	return data;
};

export const upsertEncounterAction = async (actionData) => {
	const payload = { ...actionData };
	if (String(payload.id).startsWith('new')) delete payload.id;
	delete payload.actor;
	delete payload.target;
	if (payload.round_number) payload.round_number = parseInt(payload.round_number);
	if (payload.action_order) payload.action_order = parseInt(payload.action_order);
	if (payload.actor_entity_id === '') payload.actor_entity_id = null;
	if (payload.target_entity_id === '') payload.target_entity_id = null;

	const { data, error } = await supabase.from('encounter_actions').upsert(payload).select().single();
	if (error) throw error;
	return data;
};

/**
 * REPLACED with Database RPC
 * Scans the database for text matches using a server-side function.
 * Moves logic from O(N) JavaScript loop to O(1) DB Query.
 */
export const getBulkReplacePreview = async (campaignId, findTerm, replaceTerm) => {
	if (!findTerm.trim()) return [];

	const { data, error } = await supabase.rpc('api_scan_campaign_text', {
		p_campaign_id: campaignId,
		p_term: findTerm.trim(),
	});

	if (error) {
		console.error('Scan RPC failed', error);
		throw error;
	}

	const regex = new RegExp(findTerm.trim(), 'gi');

	// We still use JS for the "proposal" string generation because it's purely UI logic
	// and doing Regex Replace in SQL can be brittle with flags.
	// But the heavy lifting (filtering 10k rows) is now done by Postgres.
	return data.map((row) => ({
		table: row.table_name,
		id: row.record_id,
		field: row.field_name,
		context: row.context,
		original: row.current_value,
		proposal: row.current_value.replace(regex, replaceTerm),
	}));
};

export const executeBulkReplace = async (changeList) => {
	const results = { count: 0 };
	for (const change of changeList) {
		const { error } = await supabase
			.from(change.table)
			.update({ [change.field]: change.proposal })
			.eq('id', change.id);
		if (!error) results.count++;
	}
	return results;
};
