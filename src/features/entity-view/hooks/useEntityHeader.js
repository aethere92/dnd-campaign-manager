/**
 * useEntityHeader Hook
 * Builds header view model from entity data
 */

import { useMemo } from 'react';
import { getEntityConfig } from '../../../config/entity';
import { resolveImageUrl } from '../../../utils/image/imageResolver';
import { getAttributeValue } from '../../../utils/entity/attributeParser';
import { extractHeaderTags } from '../transforms/attributeTransform';

/**
 * Build header view model
 * @param {Object} entity - Raw entity data
 * @param {Object} attributes - Parsed attributes
 * @returns {Object} Header view model
 */
export const useEntityHeader = (entity, attributes) => {
	return useMemo(() => {
		if (!entity) return null;

		const config = getEntityConfig(entity.type);

		// Resolve images
		const headerBackgroundUrl = resolveImageUrl(attributes, 'background');
		const avatarUrl = resolveImageUrl(attributes, 'icon');

		// Resolve status
		let statusRaw = entity.status || getAttributeValue(attributes, ['status']);
		if (Array.isArray(statusRaw)) {
			statusRaw = statusRaw.join(', ');
		}
		if (statusRaw && typeof statusRaw !== 'string') {
			statusRaw = String(statusRaw);
		}

		// Extract extra tags (session-specific)
		const extraTags = extractHeaderTags(attributes, entity.type);

		return {
			title: entity.name,
			typeLabel: entity.type?.toUpperCase(),
			imageUrl: headerBackgroundUrl,
			avatarUrl: avatarUrl,
			status: {
				hasStatus: !!statusRaw,
				label: statusRaw,
				isDead: statusRaw?.toLowerCase() === 'dead' || statusRaw?.toLowerCase() === 'failed',
			},
			extraTags,
			theme: {
				...config.tailwind,
				Icon: config.icon,
			},
		};
	}, [entity, attributes]);
};
