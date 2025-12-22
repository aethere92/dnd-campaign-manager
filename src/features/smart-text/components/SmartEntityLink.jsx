/**
 * SmartEntityLink - MIGRATED to use EntityLink component
 * This is now just a thin wrapper that adds entity index lookup
 */

import EntityLink from '../../../components/entity/EntityLink';
import { useEntityIndex } from '../useEntityIndex';

export const SmartEntityLink = ({ id, type, children }) => {
	const entityIndex = useEntityIndex();

	// Look up custom icon from entity index
	const entity = entityIndex.find((e) => e.id === id);
	const customIconUrl = entity?.iconUrl;

	return (
		<EntityLink id={id} type={type} customIconUrl={customIconUrl} inline>
			{children}
		</EntityLink>
	);
};
