import React from 'react';
import { ImageOverlay, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { useAtlasEditor } from '../AtlasEditorContext';

export default function EditOverlaysLayer() {
	const { state, dispatch } = useAtlasEditor();
	const { overlays, selection, activeTool } = state;
	const isInteractive = activeTool === 'overlays';

	// Helper to resolve URL
	const getUrl = (path) => (path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path}`);

	return (
		<>
			{overlays.map((overlay) => {
				const isSelected = selection?.type === 'overlay' && selection.id === overlay._id;
				// Overlay bounds: [[lat1, lng1], [lat2, lng2]]

				return (
					<React.Fragment key={overlay._id}>
						<ImageOverlay
							url={getUrl(overlay.image)}
							bounds={overlay.bounds}
							opacity={0.8}
							interactive={isInteractive} // Allows clicks pass through if not editing overlays
							eventHandlers={{
								click: (e) => {
									if (!isInteractive) return;
									L.DomEvent.stopPropagation(e);
									dispatch({ type: 'SELECT_ITEM', payload: { type: 'overlay', id: overlay._id } });
								},
							}}
						/>

						{/* Render a bounding box border when selected */}
						{isSelected && (
							<Rectangle
								bounds={overlay.bounds}
								pathOptions={{ color: '#3b82f6', weight: 2, fill: false, dashArray: '5, 5' }}
							/>
						)}
					</React.Fragment>
				);
			})}
		</>
	);
}
