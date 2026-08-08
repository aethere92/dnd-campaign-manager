import { useState, useCallback } from 'react';
import { storage, STORAGE_KEYS } from '@/shared/utils/storage';

/**
 * Remembers the last-used campaign id.
 *
 * Since the campaign now lives in the URL, this is no longer the source of truth —
 * it only answers "which campaign should bare `/` resume?". <CampaignScope> mirrors
 * the URL into here on every campaign-scoped navigation.
 *
 * The id is `campaigns.id`, a UUID string — the value every entity row's
 * `campaign_id` column references. (The separate integer `campaigns.campaign_id`
 * column is only a display number and is NOT what entities point at.) It is kept
 * as a string throughout; coercing it to a Number would turn the UUID into NaN.
 *
 * Anything that is not UUID-shaped is rejected. An earlier build briefly stored an
 * integer id here; without this guard that stale value would be read back on load,
 * used to build `/c/2`, and rejected by the database. Ignoring it sends the user
 * cleanly to the picker instead.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const normalizeId = (raw) => {
	if (raw == null || raw === '') return null;
	const s = String(raw);
	return UUID_RE.test(s) ? s : null;
};

export function useCampaignPersistence() {
	const [campaignId, setCampaignIdState] = useState(() => normalizeId(storage.get(STORAGE_KEYS.CAMPAIGN_ID)));

	const setCampaignId = useCallback((id) => {
		const normalised = normalizeId(id);
		setCampaignIdState(normalised);

		if (normalised != null) {
			storage.set(STORAGE_KEYS.CAMPAIGN_ID, normalised);
		} else {
			storage.remove(STORAGE_KEYS.CAMPAIGN_ID);
		}
	}, []);

	return { campaignId, setCampaignId };
}
