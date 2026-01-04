import { useMemo } from 'react';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import { extractHeaderTags } from '@/features/wiki/utils/attributeMapper';
import { capitalize } from '@/shared/utils/textUtils';

export const useEntityHeader = (entity, attributes) => {
	return useMemo(() => {
		if (!entity) return null;

		const config = getEntityConfig(entity.type);
		const headerBackgroundUrl = resolveImageUrl(attributes, 'background');
		const avatarUrl = resolveImageUrl(attributes, 'icon');

		// Status
		let statusRaw = entity.status || getAttributeValue(attributes, ['status']);
		if (Array.isArray(statusRaw)) statusRaw = statusRaw.join(', ');

		// Priority
		const priorityRaw = getAttributeValue(attributes, ['priority', 'Priority']);

		// Extra Tags
		const extraTags = extractHeaderTags(attributes, entity.type);

		// --- NEW: Character Subtitle Logic ---
		let subtitle = null;
		if (entity.type === 'character') {
			const race = attributes.race || 'Unknown Race';
			const cls = attributes.class || 'Unknown Class';
			const level = attributes.level ? `Level ${attributes.level}` : '';
			// Format: "Earth Genasi • Fighter Echo Knight • Level 8"
			subtitle = [race, cls, level].filter(Boolean).join(' • ');
		}

		return {
			title: entity.name,
			subtitle, // Pass the new subtitle
			typeLabel: entity.type?.toUpperCase(),
			imageUrl: headerBackgroundUrl,
			avatarUrl: avatarUrl,
			status: {
				hasStatus: !!statusRaw,
				label: statusRaw ? capitalize(String(statusRaw)) : '',
				isDead: statusRaw?.toLowerCase() === 'dead' || statusRaw?.toLowerCase() === 'failed',
			},
			priority: priorityRaw ? capitalize(priorityRaw) : null,
			extraTags,
			type: entity.type,
			theme: {
				...config.tailwind,
				Icon: config.icon,
			},
		};
	}, [entity, attributes]);
};
