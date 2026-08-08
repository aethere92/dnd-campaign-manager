/**
 * SmartEntityLink - MIGRATED to use EntityLink component
 * This is now just a thin wrapper that adds entity index lookup
 */

import EntityLink from '@/domain/entity/components/EntityLink';
import { useEntityIndex } from '@/features/smart-text/hooks/useEntityIndex';

export const SmartEntityLink = ({ id, type, children }) => {
	const { map: entityMap } = useEntityIndex();

	const entity = entityMap.get(id);
	const customIconUrl = entity?.iconUrl;

	return (
		<EntityLink id={id} type={type} customIconUrl={customIconUrl} inline>
			{children}
		</EntityLink>
	);
};
