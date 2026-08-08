import { supabase } from '@/shared/api/supabaseClient';

export const getCampaigns = async () => {
	/**
	 * OPTIMIZATION:
	 * Instead of fetching all entities and filtering in JS or via multiple query params,
	 * we join 'view_active_party'. This SQL view already filters for:
	 * (attributes->>'is_active')::boolean = true
	 */
	const { data, error } = await supabase.from('campaigns').select(`
            id,
            campaign_id,
            name, 
            description,
            attributes,
            active_characters:view_active_party(name)
        `);

	if (error) {
		console.error('[campaignService] Error fetching campaigns:', error);
		throw error;
	}

	// Clean up the nested structure
	return data.map((campaign) => ({
		...campaign,
		// Map the view results to the characterNames array used by the UI
		characterNames: campaign.active_characters?.map((c) => c.name) || [],
	}));
};

/**
 * Fetch a single campaign by primary key.
 *
 * IMPORTANT — which id this is:
 * `campaigns.id` is a UUID, and it is the value every entity row's `campaign_id`
 * column points at, so all entity queries do `.eq('campaign_id', campaigns.id)`.
 * The separate integer `campaigns.campaign_id` column is only a display number and
 * is NOT a foreign key target — resolving by it returns a campaign whose entities
 * all come back empty (or, since the columns are different types, a query error).
 * This deliberately uses the UUID `id`.
 *
 * Uses maybeSingle(), not single(): a URL can name a campaign that does not exist,
 * and that is a 404 to render, not an exception to throw. single() rejects on zero
 * rows, which would surface an unrecoverable error for a mistyped URL.
 */
/**
 * Verify the currently-set DM password by attempting a no-op write.
 *
 * The write policies gate on check_dm_password(). A wrong password does NOT error
 * — RLS just makes the rows invisible, so the update matches nothing and returns
 * an empty array. So the test is "did a row come back?", not "did it throw":
 * with `.select()`, the right password echoes the row, the wrong one yields [].
 *
 * The update sets a campaign's name to the value it already has, so it changes no
 * data even when it succeeds. Assumes the DM password is already set in the
 * session (supabaseClient forwards it); returns true iff it is accepted.
 */
export const verifyDmPassword = async () => {
	// Grab any one campaign to target. Reading is always allowed.
	const { data: rows, error: readError } = await supabase.from('campaigns').select('id, name').limit(1);
	if (readError) throw readError;
	if (!rows || rows.length === 0) return false; // No campaigns to probe against.

	const target = rows[0];
	const { data: updated, error } = await supabase
		.from('campaigns')
		.update({ name: target.name }) // no-op: same value
		.eq('id', target.id)
		.select('id');

	if (error) throw error;
	return Array.isArray(updated) && updated.length > 0;
};

export const getCampaignById = async (id) => {
	const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();

	if (error) {
		console.error('[campaignService] Error fetching campaign:', error);
		throw error;
	}

	return data;
};
