import { Settings, Crosshair, X } from 'lucide-react';
import { useAtlasEditor } from '../AtlasEditorContext';
import { ADMIN_INPUT_CLASS } from '@/features/admin/components/AdminFormStyles';

export default function MapPropertiesForm({ onClose }) {
	const { state, actions } = useAtlasEditor();
	const { mapConfig, viewport } = state;

	const initialView = mapConfig.initialView || { lat: 0, lng: 0, zoom: 0 };

	const handleCaptureView = () => {
		if (!viewport) return;
		actions.updateMapConfig({
			initialView: {
				lat: Number(viewport.center.lat.toFixed(4)),
				lng: Number(viewport.center.lng.toFixed(4)),
				zoom: viewport.zoom,
			},
		});
	};

	const handleResetView = () => {
		actions.updateMapConfig({ initialView: null });
	};

	return (
		<div className='flex flex-col h-full bg-muted/10 w-full'>
			<div className='flex justify-between items-center px-5 py-4 border-b border-border bg-background shrink-0 sticky top-0 z-10'>
				<span className='font-bold text-sm uppercase flex items-center gap-2'>
					<Settings size={16} />
					Map Properties
				</span>
				<button
					onClick={onClose}
					className='w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md transition-colors'>
					<X size={16} />
				</button>
			</div>

			<div className='p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar'>
				<div className='space-y-4 p-4 rounded-xl border border-border bg-card/50'>
					<div className='flex items-center justify-between'>
						<label className='text-[10px] font-bold uppercase text-muted-foreground tracking-wide'>
							Default Start View
						</label>
						{mapConfig.initialView && (
							<button onClick={handleResetView} className='text-[10px] text-red-500 hover:underline'>
								Reset to Full
							</button>
						)}
					</div>

					<div className='grid grid-cols-3 gap-2 text-center'>
						<div className='bg-background border border-border rounded p-2'>
							<div className='text-[10px] text-muted-foreground'>LAT</div>
							<div className='font-mono text-xs font-bold'>{initialView.lat}</div>
						</div>
						<div className='bg-background border border-border rounded p-2'>
							<div className='text-[10px] text-muted-foreground'>LNG</div>
							<div className='font-mono text-xs font-bold'>{initialView.lng}</div>
						</div>
						<div className='bg-background border border-border rounded p-2'>
							<div className='text-[10px] text-muted-foreground'>ZOOM</div>
							<div className='font-mono text-xs font-bold'>{initialView.zoom}</div>
						</div>
					</div>

					<button
						onClick={handleCaptureView}
						className='w-full flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md transition-colors text-xs font-bold uppercase'>
						<Crosshair size={14} />
						Set Current View as Default
					</button>
				</div>

				<div className='space-y-4 p-4 rounded-xl border border-border bg-card/50'>
					<label className='text-[10px] font-bold uppercase text-muted-foreground tracking-wide'>Metadata</label>
					<div>
						<span className='text-xs text-muted-foreground block mb-1'>Label</span>
						<input
							className={ADMIN_INPUT_CLASS}
							value={mapConfig.label || ''}
							onChange={(e) => actions.updateMapConfig({ label: e.target.value })}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
