import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useEntityIndex } from '@/features/smart-text/useEntityIndex';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { capitalize } from '@/shared/utils/textUtils';

const ROUTE_LABELS = {
	dm: 'DM Console',
	manage: 'Manage',
	atlas: 'Atlas',
	timeline: 'Timeline',
	relationships: 'Graph',
	wiki: 'Wiki',
};

export function useBreadcrumbs() {
	const location = useLocation();
	const { map: entityMap } = useEntityIndex(); // DESTRUCTURED: Use Map

	const breadcrumbs = useMemo(() => {
		const pathnames = location.pathname.split('/').filter((x) => x);
		const crumbs = [];

		crumbs.push({
			label: 'Home',
			path: '/',
			isCurrent: pathnames.length === 0,
		});

		const isWiki = pathnames[0] === 'wiki';
		const SKIP_SEGMENTS = ['manage', 'wiki'];

		let currentPath = '';

		for (let i = 0; i < pathnames.length; i++) {
			const segment = pathnames[i];
			currentPath += `/${segment}`;

			if (SKIP_SEGMENTS.includes(segment)) continue;

			const isLast = i === pathnames.length - 1;
			const isUUID = /^[0-9a-fA-F-]{36}$/.test(segment);

			if (isWiki && isUUID) {
				// OPTIMIZATION: O(1) Lookup
				const targetEntity = entityMap.get(segment);

				if (targetEntity) {
					const hierarchyStack = [];
					let current = targetEntity;
					const visited = new Set([current.id]);

					// Fast recursive climb using Map
					while (current.parentId) {
						const parent = entityMap.get(current.parentId);
						if (!parent || visited.has(parent.id)) break;

						visited.add(parent.id);
						hierarchyStack.unshift(parent);
						current = parent;
					}

					hierarchyStack.forEach((ancestor) => {
						crumbs.push({
							label: ancestor.name,
							path: `/wiki/${ancestor.type}/${ancestor.id}`,
							isCurrent: false,
							icon: null,
						});
					});

					crumbs.push({
						label: targetEntity.name,
						path: currentPath,
						isCurrent: isLast,
					});
				} else {
					crumbs.push({ label: 'Unknown Entity', path: currentPath, isCurrent: isLast });
				}
			} else if (segment === 'new') {
				crumbs.push({ label: 'Create New', path: currentPath, isCurrent: isLast });
			} else if (getEntityConfig(segment).type !== 'default') {
				const config = getEntityConfig(segment);
				crumbs.push({
					label: config.labelPlural,
					path: currentPath,
					isCurrent: isLast,
					icon: config.icon,
				});
			} else {
				const label = ROUTE_LABELS[segment] || capitalize(segment.replace(/_/g, ' '));
				crumbs.push({ label, path: currentPath, isCurrent: isLast });
			}
		}

		return crumbs;
	}, [location.pathname, entityMap]);

	return breadcrumbs;
}
