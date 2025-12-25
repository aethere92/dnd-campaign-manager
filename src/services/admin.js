import { supabase } from '../lib/supabase';
import { getStrategy } from '../features/admin-console/config/strategies';

// Helper to prepare attribute rows
const prepareAttributeRows = (entityId, data) => {
	// If we have a prepared list (from the new form logic), use it
	if (data.attributesList && Array.isArray(data.attributesList)) {
		return data.attributesList
			.filter((attr) => attr.name && String(attr.value).trim() !== '')
			.map((attr) => ({
				entity_id: entityId,
				name: attr.name,
				value: attr.value,
				is_private: false,
			}));
	}

	// Fallback for legacy object format (just in case)
	if (data.attributes) {
		return Object.entries(data.attributes)
			.filter(([_, value]) => value && String(value).trim() !== '')
			.map(([key, value]) => ({
				entity_id: entityId,
				name: key,
				value: value,
				is_private: false,
			}));
	}
	return [];
};

export const createEntity = async (type, data) => {
	const strategy = getStrategy(type);

	// 1. Prepare Core Payload
	const corePayload = {};

	// Only add parent campaign_id if it's NOT a campaign itself
	if (type !== 'campaign') {
		corePayload.campaign_id = data.campaign_id;
	}

	// Name/Desc Mapping
	if (strategy.colMapping) {
		if (data.name) corePayload[strategy.colMapping.name] = data.name;
		if (data.description) corePayload[strategy.colMapping.description] = data.description;
	}
	if (strategy.primaryTable === 'entities') corePayload.type = type;

	// FIX #4: Extract Special Columns from Attributes (e.g. Campaign ID, Map Data)
	// We look at the incoming attributesList or attributes object
	const rawAttributes =
		data.attributesList ||
		(data.attributes ? Object.entries(data.attributes).map(([k, v]) => ({ name: k, value: v })) : []);

	const attributesToInsert = [];

	rawAttributes.forEach((attr) => {
		// Does this attribute match a known column in the definitions?
		// Simple check: For campaigns, 'campaign_id' and 'map_data' are columns.
		const isSpecialColumn = strategy.defaultAttributes?.find((def) => def.key === attr.name && type === 'campaign');

		if (isSpecialColumn) {
			// It's a column! Add to core payload.
			corePayload[attr.name] = attr.value;
		} else {
			// It's a normal attribute. Keep for attributes table.
			attributesToInsert.push(attr);
		}
	});

	console.log('[Admin] Creating:', corePayload);

	// 2. Insert Core
	const { data: insertedRecord, error: insertError } = await supabase
		.from(strategy.primaryTable)
		.insert(corePayload)
		.select()
		.single();

	if (insertError) throw insertError;
	const newId = insertedRecord.id;

	// 3. Insert Remaining Attributes (if any)
	// Campaigns usually don't use the attributes table, so this might be empty, which is fine.
	if (attributesToInsert.length > 0 && strategy.primaryTable !== 'campaigns') {
		const rows = attributesToInsert.map((attr) => ({
			entity_id: newId,
			name: attr.name,
			value: attr.value,
			is_private: false,
		}));

		const { error: attrError } = await supabase.from('attributes').insert(rows);
		if (attrError) throw attrError;
	}

	return { id: newId, ...insertedRecord };
};

export const updateEntity = async (type, id, data) => {
	const strategy = getStrategy(type);

	// 1. Prepare Core Payload
	const corePayload = {};
	if (strategy.colMapping) {
		if (data.name) corePayload[strategy.colMapping.name] = data.name;
		if (data.description) corePayload[strategy.colMapping.description] = data.description;
	}

	// FIX: Extract Special Columns from Attributes
	const rawAttributes =
		data.attributesList ||
		(data.attributes ? Object.entries(data.attributes).map(([k, v]) => ({ name: k, value: v })) : []);

	const attributesToInsert = [];

	rawAttributes.forEach((attr) => {
		const isSpecialColumn = strategy.defaultAttributes?.find((def) => def.key === attr.name && type === 'campaign');

		if (isSpecialColumn) {
			corePayload[attr.name] = attr.value;
		} else {
			attributesToInsert.push(attr);
		}
	});

	// 2. Update Core
	const { error: updateError } = await supabase.from(strategy.primaryTable).update(corePayload).eq('id', id);

	if (updateError) throw updateError;

	// 3. Handle Attributes (Skip for campaigns usually)
	if (strategy.primaryTable !== 'campaigns') {
		// Delete old
		const { error: deleteError } = await supabase.from('attributes').delete().eq('entity_id', id);
		if (deleteError) throw deleteError;

		// Insert new
		if (attributesToInsert.length > 0) {
			const rows = attributesToInsert.map((attr) => ({
				entity_id: id,
				name: attr.name,
				value: attr.value,
				is_private: false,
			}));
			const { error: insertError } = await supabase.from('attributes').insert(rows);
			if (insertError) throw insertError;
		}
	}

	return { success: true };
};

export const fetchRawEntity = async (type, id) => {
	const strategy = getStrategy(type);

	// 1. Fetch Core Data
	const { data: coreData, error: coreError } = await supabase
		.from(strategy.primaryTable)
		.select('*')
		.eq('id', id)
		.single();

	if (coreError) throw coreError;

	// 2. Fetch Attributes (As List)
	const { data: attrData, error: attrError } = await supabase
		.from('attributes')
		.select('name, value')
		.eq('entity_id', id);

	if (attrError) throw attrError;

	// 3. Reverse Map Core Columns
	const formData = { ...coreData };
	if (strategy.colMapping) {
		Object.entries(strategy.colMapping).forEach(([formField, dbCol]) => {
			if (coreData[dbCol] !== undefined) {
				formData[formField] = coreData[dbCol];
			}
		});
	}

	// 4. FIX: Map Column-based attributes (Campaigns) into the Attribute List
	// If the strategy says 'campaign_id' is an attribute, but it exists on 'coreData',
	// we fake it as an attribute so the UI renders it.
	if (strategy.defaultAttributes) {
		strategy.defaultAttributes.forEach((defAttr) => {
			if (coreData[defAttr.key] !== undefined) {
				attrData.push({
					name: defAttr.key,
					value: coreData[defAttr.key],
				});
			}
		});
	}

	// RETURN RAW ATTRIBUTE LIST
	// We intentionally do NOT convert to an object here to preserve duplicates
	return { ...formData, attributesList: attrData };
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

/**
 * Add a new relationship
 * Note: Your DB trigger 'create_reverse_relationship' handles the reverse link automatically
 * if is_bidirectional is true.
 */
export const addRelationship = async (payload) => {
	// payload = { from_entity_id, to_entity_id, relationship_type, is_bidirectional }
	const { data, error } = await supabase.from('entity_relationships').insert(payload).select().single();

	if (error) throw error;
	return data;
};

/**
 * Delete a relationship
 */
export const deleteRelationship = async (relId) => {
	const { error } = await supabase.from('entity_relationships').delete().eq('id', relId);

	if (error) throw error;
	return true;
};

/**
 * Fetch child rows (e.g., session_events)
 */
export const fetchChildRows = async (table, foreignKeyCol, parentId, orderBy = 'id') => {
	const { data, error } = await supabase
		.from(table)
		.select('*')
		.eq(foreignKeyCol, parentId)
		.order(orderBy, { ascending: true });

	if (error) throw error;
	return data;
};

/**
 * Save a single event.
 * If no ID, it creates. If ID, it updates.
 */
export const upsertSessionEvent = async (eventData) => {
	// 1. Remove ID if it's a placeholder "new"
	const payload = { ...eventData };
	if (String(payload.id).startsWith('new')) {
		delete payload.id;
	}

	const { data, error } = await supabase.from('session_events').upsert(payload).select().single();

	if (error) throw error;
	return data;
};

/**
 * Delete a generic row
 */
export const deleteRow = async (table, id) => {
	const { error } = await supabase.from(table).delete().eq('id', id);
	if (error) throw error;
	return true;
};

/**
 * Save a single quest objective.
 */
export const upsertQuestObjective = async (objectiveData) => {
	// Remove temp ID
	const payload = { ...objectiveData };
	if (String(payload.id).startsWith('new')) {
		delete payload.id;
	}

	const { data, error } = await supabase.from('quest_objectives').upsert(payload).select().single();

	if (error) throw error;
	return data;
};

export const deleteEntity = async (type, id) => {
	const strategy = getStrategy(type);

	// 1. Delete Attributes
	const { error: attrError } = await supabase.from('attributes').delete().eq('entity_id', id);

	if (attrError) console.warn('Attribute delete warning:', attrError);

	// 2. Delete Primary Row (Cascades to 'entities' via DB trigger)
	const { error: mainError } = await supabase.from(strategy.primaryTable).delete().eq('id', id);

	if (mainError) throw mainError;
	return true;
};

export const updateRelationship = async (relId, updates) => {
	const { error } = await supabase.from('entity_relationships').update(updates).eq('id', relId);

	if (error) throw error;
	return true;
};

export const searchEntitiesByName = async (campaignId, query) => {
	const searchTerm = `%${query}%`;

	// 1. Search Entities (NPCs, Locations, Characters, Factions, Quests, Items)
	// We strictly search the 'name' column here.
	const { data: entities } = await supabase
		.from('entities')
		.select('id, name, type, description')
		.eq('campaign_id', campaignId)
		.ilike('name', searchTerm)
		.limit(15); // Higher limit

	// 2. Search Sessions (Sessions are often separate)
	const { data: sessions } = await supabase
		.from('sessions')
		.select('id, title, narrative')
		.eq('campaign_id', campaignId)
		.ilike('title', searchTerm)
		.limit(5);

	// Normalize Sessions to match Entity structure
	const normSessions = (sessions || []).map((s) => ({
		id: s.id,
		name: s.title,
		type: 'session',
		description: s.narrative,
	}));

	return [...(entities || []), ...normSessions];
};

export const getSessionList = async (campaignId) => {
	const { data, error } = await supabase
		.from('sessions')
		.select('id, title')
		.eq('campaign_id', campaignId)
		.order('title', { ascending: true }); // Assuming title starts with "01", "02", etc.

	if (error) throw error;
	return data;
};

/**
 * Fetch session events AND their relationships (mentions) efficiently.
 */
export const fetchSessionEventsWithRelationships = async (sessionId) => {
	// 1. Fetch Events
	const { data: events, error: eventError } = await supabase
		.from('session_events')
		.select('*')
		.eq('session_id', sessionId)
		.order('event_order', { ascending: true });

	if (eventError) throw eventError;
	if (!events || events.length === 0) return [];

	// 2. Fetch Relationships for ALL these events at once
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

	// 3. Group Relationships by Event ID
	const relMap = {};
	rels.forEach((r) => {
		if (!relMap[r.from_entity_id]) relMap[r.from_entity_id] = [];
		relMap[r.from_entity_id].push(r);
	});

	// 4. Merge back into Event objects
	return events.map((e) => ({
		...e,
		relationships: relMap[e.id] || [],
	}));
};

/**
 * Fetch encounter actions with resolved actor/target names
 */
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

/**
 * Upsert an encounter action (turn)
 */
export const upsertEncounterAction = async (actionData) => {
	const payload = { ...actionData };

	// 1. Remove temporary ID
	if (String(payload.id).startsWith('new')) {
		delete payload.id;
	}

	// 2. Remove joined objects (derived data from the fetch) to prevent column errors
	delete payload.actor;
	delete payload.target;

	// 3. Ensure numeric types
	if (payload.round_number) payload.round_number = parseInt(payload.round_number);
	if (payload.action_order) payload.action_order = parseInt(payload.action_order);

	// 4. Ensure optional UUIDs are null if empty string
	if (payload.actor_entity_id === '') payload.actor_entity_id = null;
	if (payload.target_entity_id === '') payload.target_entity_id = null;

	const { data, error } = await supabase.from('encounter_actions').upsert(payload).select().single();

	if (error) throw error;
	return data;
};
