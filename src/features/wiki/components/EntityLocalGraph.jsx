import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Maximize, Minimize } from 'lucide-react';
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

	// FULLSCREEN STATE
	const containerRef = useRef(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

	// Combine native and pseudo states
	const activeFullscreen = isFullscreen || isPseudoFullscreen;

	// Handle Native Fullscreen Changes
	useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	}, []);

	// Handle Escape Key for Pseudo Fullscreen
	useEffect(() => {
		const handleEsc = (e) => {
			if (e.key === 'Escape' && isPseudoFullscreen) setIsPseudoFullscreen(false);
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [isPseudoFullscreen]);

	// Toggle Function
	const toggleFullscreen = useCallback(
		(e) => {
			e.stopPropagation();
			if (!containerRef.current) return;

			const supportsNative = document.fullscreenEnabled || containerRef.current.requestFullscreen;

			// Prefer native, fallback to pseudo (iOS)
			if (supportsNative) {
				if (!document.fullscreenElement) {
					containerRef.current.requestFullscreen().catch(() => setIsPseudoFullscreen(true));
				} else {
					document.exitFullscreen();
				}
			} else {
				setIsPseudoFullscreen(!isPseudoFullscreen);
			}
		},
		[isPseudoFullscreen]
	);

	// --- DATA TRANSFORMATION ---
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

			// Apply Colors
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
					edges.push({
						data: { source: groupIds[i], target: groupIds[(i + 1) % groupIds.length], type: 'virtual' },
					});
				}
			}
		});

		return [...nodes, ...edges];
	}, [entity, relationships, isDark, entityIndex]);

	const handleNodeClick = useCallback(
		(data) => {
			if (activeFullscreen && document.fullscreenElement) {
				document.exitFullscreen();
			}
			if (isPseudoFullscreen) setIsPseudoFullscreen(false);

			if (data.id && data.type && data.id !== entity.id) {
				navigate(`/wiki/${data.type}/${data.id}`);
			}
		},
		[navigate, entity.id, activeFullscreen, isPseudoFullscreen]
	);

	if (elements.length <= 1) return null;

	return (
		<div className={clsx('w-full flex flex-col', className)}>
			{!activeFullscreen && headerShown && (
				<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 px-1'>
					<Network size={10} /> Local Graph
				</h3>
			)}

			<div
				ref={containerRef}
				className={clsx(
					'w-full relative bg-muted/20 border border-border rounded-lg overflow-hidden group transition-all duration-300',
					// Fullscreen Styles
					activeFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen m-0 rounded-none bg-background' : height
				)}>
				{/* Graph Background */}
				<div
					className='absolute inset-0 z-0 opacity-50'
					style={{
						backgroundImage: 'radial-gradient(circle at center, var(--border) 1px, transparent 1px)',
						backgroundSize: '20px 20px',
						backgroundPosition: '10px 10px',
					}}
				/>

				{/* Fullscreen Toggle Button */}
				<button
					onClick={toggleFullscreen}
					className={clsx(
						'absolute z-50 p-2 rounded-full border border-border shadow-sm transition-all active:scale-95',
						'bg-background/90 backdrop-blur text-muted-foreground hover:text-primary hover:bg-background',
						// Positioning Logic
						activeFullscreen
							? 'top-1/2 right-4 -translate-y-1/2 lg:top-6 lg:right-6 lg:translate-y-0' // Middle-Right Mobile, Top-Right Desktop
							: 'top-2 right-2' // Normal State
					)}
					title={activeFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
					{activeFullscreen ? <Minimize size={18} /> : <Maximize size={16} />}
				</button>

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
