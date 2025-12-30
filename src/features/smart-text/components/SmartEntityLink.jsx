/**
 * SmartEntityLink - MIGRATED to use EntityLink component
 * This is now just a thin wrapper that adds entity index lookup
 */

import EntityLink from '@/domain/entity/components/EntityLink';
import { useEntityIndex } from '@/features/smart-text/useEntityIndex';

export const SmartEntityLink = ({ id, type, children }) => {
	// FIX: Destructure the 'map' from the new hook signature
	const { map: entityMap } = useEntityIndex();

	// FIX: Use .get() (O(1) speed) instead of .find()
	const entity = entityMap.get(id);
	const customIconUrl = entity?.iconUrl;

	return (
		<EntityLink id={id} type={type} customIconUrl={customIconUrl} inline>
			{children}
		</EntityLink>
	);
};
