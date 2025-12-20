import { useQuery } from '@tanstack/react-query';
import { getEntities } from '../../services/entities'; // Ensure this service exists
import { useCampaign } from '../../features/campaign-session/CampaignContext';
import { MAP_CONFIG } from './mapConfig';

export function useMapData() {
	const { campaignId } = useCampaign();

	// Fetch only 'location' type entities
	const { data: locations, isLoading } = useQuery({
		queryKey: ['entities', campaignId, 'location'],
		queryFn: () => getEntities(campaignId, 'location'),
		enabled: !!campaignId,
	});

	// Transform entities into map markers
	const markers = (locations || []).map((loc) => {
		// TODO: In the future, parse actual coordinates from loc.attributes
		// For now, we default to center so the map doesn't crash
		return {
			id: loc.id,
			label: loc.name,
			position: MAP_CONFIG.defaultCenter,
			description: loc.type,
		};
	});

	// Add a default marker if empty so the map isn't blank
	if (markers.length === 0) {
		markers.push({
			id: 'start',
			label: `Campaign Start`,
			position: MAP_CONFIG.defaultCenter,
			description: 'The adventure begins here.',
		});
	}

	return {
		markers,
		isLoading,
	};
}
