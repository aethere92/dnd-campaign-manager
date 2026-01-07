import React, { useState, useEffect } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { fetchCampaignMaps, fetchMapByKey } from '@/features/atlas/api/mapService';
import { Map as MapIcon, Loader2, Edit3, ArrowLeft } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import AtlasEditor from '@/features/admin/components/atlas/editor/AtlasEditor'; // We will create this next
import { ADMIN_HEADER_CLASS } from '@/features/admin/components/AdminFormStyles';

export default function MapManagerPage() {
	const { campaignId } = useCampaign();
	const [maps, setMaps] = useState([]);
	const [selectedMap, setSelectedMap] = useState(null);
	const [loading, setLoading] = useState(false);

	// Load list on mount
	useEffect(() => {
		if (campaignId) loadList();
	}, [campaignId]);

	const loadList = async () => {
		setLoading(true);
		try {
			const data = await fetchCampaignMaps(campaignId);
			setMaps(data || []);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	// Load full map details when selected
	const handleSelect = async (mapSummary) => {
		setLoading(true);
		try {
			const fullData = await fetchMapByKey(campaignId, mapSummary.key);
			// Merge the ID back in since fetchMapByKey flattens it
			setSelectedMap({ ...fullData, id: mapSummary.id, key: mapSummary.key });
		} catch (e) {
			alert(e.message);
		} finally {
			setLoading(false);
		}
	};

	// --- RENDER: EDITOR MODE ---
	if (selectedMap) {
		return (
			<div className='h-[calc(100vh-64px)] flex flex-col'>
				<div className='bg-background border-b border-border p-2 flex items-center gap-4'>
					<Button variant='ghost' size='sm' icon={ArrowLeft} onClick={() => setSelectedMap(null)}>
						Back to List
					</Button>
					<span className='font-bold font-serif text-lg'>{selectedMap.metadata?.label || selectedMap.key}</span>
				</div>
				<div className='flex-1 overflow-hidden relative'>
					<AtlasEditor initialData={selectedMap} />
				</div>
			</div>
		);
	}

	// --- RENDER: LIST MODE ---
	return (
		<div className='max-w-5xl mx-auto p-8 space-y-6'>
			<h1 className={ADMIN_HEADER_CLASS}>
				<span className='flex items-center gap-2'>
					<MapIcon className='text-primary' /> Atlas Manager
				</span>
			</h1>

			{loading && (
				<div className='text-center py-10'>
					<Loader2 className='animate-spin mx-auto' />
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{!loading &&
					maps.map((m) => (
						<button
							key={m.id}
							onClick={() => handleSelect(m)}
							className='group flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left'>
							<div className='w-full flex justify-between items-start mb-2'>
								<span className='text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground group-hover:text-primary transition-colors'>
									{m.key}
								</span>
								<Edit3 size={16} className='opacity-0 group-hover:opacity-100 transition-opacity text-primary' />
							</div>
							<h3 className='font-bold text-lg'>{m.title}</h3>
						</button>
					))}
			</div>

			{!loading && maps.length === 0 && (
				<div className='text-center py-20 text-muted-foreground italic border-2 border-dashed border-border rounded-xl'>
					No maps found in database. Run the migration tool first.
				</div>
			)}
		</div>
	);
}
