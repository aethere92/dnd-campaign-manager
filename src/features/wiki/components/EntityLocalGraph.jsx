import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { clsx } from 'clsx';
import { CytoscapeCanvas } from '@/features/graph/components/CytoscapeCanvas';
import { resolveImageUrl } from '@/shared/utils/imageUtils';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { useTheme } from '@/shared/hooks/useTheme';
import { useEntityIndex } from '@/features/smart-text/useEntityIndex';

// --- LOCAL GRAPH CONFIGURATION ---
const LOCAL_LAYOUT = {
	name: 'fcose',
	quality: 'default',
	randomize: true,
	animate: true,
	animationDuration: 800,
	fit: true,
	padding: 30,
	nodeDimensionsIncludeLabels: true,

	nodeRepulsion: 8000,
	idealEdgeLength: 80,
	edgeElasticity: 0.45,
	gravity: 0.3,
	numIter: 2500,
	tilingPaddingVertical: 10,
	tilingPaddingHorizontal: 10,
	initialEnergyOnIncremental: 0.3,
};

const getLocalStyles = (isDark) => {
	const colors = {
		text: isDark ? '#e5e5e5' : '#171717',
		border: isDark ? '#404040' : '#d4d4d4',
		halo: isDark ? '#000000' : '#ffffff',
		edge: isDark ? '#525252' : '#a3a3a3',
	};

	return [
		{
			selector: 'node',
			style: {
				width: 16,
				height: 16,
				label: 'data(label)',
				'background-image': 'data(image)',
				'background-fit': 'cover',
				'border-width': 1,
				'border-color': 'data(borderColor)',
				'background-color': 'data(bgColor)',
				'font-family': 'Inter, sans-serif',
				'font-size': '8px',
				'font-weight': '600',
				'text-valign': 'bottom',
				'text-margin-y': 4,
				'text-outline-color': colors.halo,
				'text-outline-width': 2,
				color: colors.text,
				'transition-property': 'width, height, border-width',
				'transition-duration': '0.2s',
			},
		},
		{
			selector: 'node[?isCenter]',
			style: {
				width: 28,
				height: 28,
				'border-width': 2,
				'font-size': '10px',
				'z-index': 10,
			},
		},
		{
			selector: 'edge[type != "virtual"]',
			style: {
				width: 1,
				'curve-style': 'bezier',
				'line-color': colors.edge,
				'target-arrow-shape': 'none',
				opacity: 0.5,
			},
		},
		{
			selector: 'edge[type = "virtual"]',
			style: {
				width: 0,
				opacity: 0,
				'curve-style': 'straight',
				events: 'no',
			},
		},
	];
};

export const EntityLocalGraph = ({ entity, relationships, className, height = 'h-64', headerShown = true }) => {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const { map: entityIndex } = useEntityIndex();
	const isDark = theme === 'dark';

	const elements = useMemo(() => {
		if (!entity) return [];

		const nodes = [];
		const edges = [];
		const addedIds = new Set();
		const typeGroups = {};

		const FALLBACK_ICON_ROOT = 'images/icons';

		const resolveNodeIcon = (type, attributes, id) => {
			let url = resolveImageUrl(attributes, 'icon');
			if (!url && id && entityIndex.has(id)) {
				const cached = entityIndex.get(id);
				if (cached.iconUrl) url = cached.iconUrl;
			}
			if (!url) {
				const safeType = (type || 'default').toLowerCase().replace(/\s+/g, '_');
				url = `${FALLBACK_ICON_ROOT}/${safeType}.webp`;
			}
			return url;
		};

		const addNode = (id, name, type, attributes = {}, isCenter = false) => {
			if (!id || addedIds.has(id)) return;
			addedIds.add(id);

			if (!isCenter) {
				if (!typeGroups[type]) typeGroups[type] = [];
				typeGroups[type].push(id);
			}

			const config = getEntityConfig(type);
			const finalImage = resolveNodeIcon(type, attributes, id);

			// FIX: Always use config color if available, regardless of image source
			const borderColor = config.color || (isDark ? '#404040' : '#d4d4d4');
			const nodeBgColor = config.color || (isDark ? '#262626' : '#f5f5f5');

			nodes.push({
				data: {
					id,
					label: name,
					image: finalImage,
					type,
					bgColor: nodeBgColor,
					borderColor,
					isCenter,
				},
				classes: isCenter ? 'center' : '',
			});
		};

		addNode(entity.id, entity.name, entity.type, entity.attributes, true);

		if (relationships) {
			relationships.forEach((rel) => {
				const targetId = rel.id || rel.entity_id || rel.target;
				const targetName = rel.name || rel.entity_name;
				const targetType = rel.typeLabel || rel.entity_type || rel.type || 'default';

				if (targetId) {
					addNode(targetId, targetName, targetType, {});
					edges.push({
						data: {
							source: entity.id,
							target: targetId,
							type: 'standard',
						},
					});
				}
			});
		}

		Object.keys(typeGroups).forEach((type) => {
			const groupIds = typeGroups[type];
			if (groupIds.length > 1 && groupIds.length < 15) {
				for (let i = 0; i < groupIds.length; i++) {
					const current = groupIds[i];
					const next = groupIds[i + 1];
					if (next) {
						edges.push({
							data: { source: current, target: next, type: 'virtual' },
						});
					}
				}
			}
		});

		return [...nodes, ...edges];
	}, [entity, relationships, isDark, entityIndex]);

	const handleNodeClick = useCallback(
		(data) => {
			if (data.id && data.type && data.id !== entity.id) {
				navigate(`/wiki/${data.type}/${data.id}`);
			}
		},
		[navigate, entity.id]
	);

	if (elements.length <= 1) return null;

	return (
		<div className={clsx('w-full flex flex-col', className)}>
			{headerShown && (
				<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 px-1'>
					<Network size={10} /> Local Graph
				</h3>
			)}
			<div className={clsx('w-full relative bg-muted/20 border border-border/50 rounded-lg overflow-hidden', height)}>
				<div
					className='absolute inset-0 z-0 opacity-50'
					style={{
						backgroundImage: 'radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
						backgroundSize: '20px 20px',
						backgroundPosition: '10px 10px',
					}}
				/>
				<CytoscapeCanvas
					elements={elements}
					layoutConfig={LOCAL_LAYOUT}
					stylesheet={getLocalStyles(isDark)}
					onNodeClick={handleNodeClick}
					interactive={true}
				/>
			</div>
		</div>
	);
};
