import React, { useState } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { upsertMap } from '@/features/atlas/api/mapService';
import Button from '@/shared/components/ui/Button';
import { UploadCloud, CheckCircle, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS } from '@/features/admin/components/AdminFormStyles';

export default function MapMigrationTool() {
	const { campaignId, campaignData } = useCampaign();
	const [status, setStatus] = useState({});
	const [isProcessing, setIsProcessing] = useState(false);

	const handleMigration = async () => {
		if (!campaignId || !campaignData) return;
		if (!confirm(`Overwrite database maps for campaign ${campaignId} with data from local files?`)) return;

		setIsProcessing(true);
		const newStatus = {};

		const maps = campaignData.maps || {};
		const mapKeys = Object.keys(maps);

		for (const key of mapKeys) {
			const mapObj = maps[key];
			try {
				const metadata = mapObj.metadata || {};

				// --- FIX FOR NESTED MAPS ---
				// Capture parentId if it exists at the root level of the file object
				const configPayload = {
					...metadata,
					parentId: mapObj.parentId || metadata.parentId || null,
				};

				const contentData = {
					annotations: mapObj.annotations || {},
					paths: mapObj.paths || [],
					areas: mapObj.areas || {},
					overlays: mapObj.overlays || [],
				};

				await upsertMap(
					campaignId,
					key,
					metadata.label || key,
					configPayload, // Now contains parentId
					contentData
				);

				newStatus[key] = { success: true, msg: 'Synced' };
			} catch (err) {
				console.error(err);
				newStatus[key] = { success: false, msg: err.message };
			}
		}

		setStatus(newStatus);
		setIsProcessing(false);
	};

	if (!campaignData) return <div className='p-8'>Select a campaign with file-based maps first.</div>;

	return (
		<div className='max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in'>
			<div className={ADMIN_SECTION_CLASS}>
				<h2 className={ADMIN_HEADER_CLASS}>
					<span className='flex items-center gap-2'>
						<Database size={18} className='text-blue-600' /> Map Database Migration
					</span>
				</h2>

				<div className='p-4 bg-amber-500/10 border border-amber-200 rounded-lg text-sm text-amber-900 mb-6 flex gap-3 items-start'>
					<AlertTriangle size={18} className='shrink-0 mt-0.5' />
					<div>
						<p className='font-bold mb-1'>Overwrite Warning</p>
						<p>
							This tool reads the <strong>local .js map files</strong> (Legacy) and pushes them into the{' '}
							<strong>Supabase 'maps' table</strong>.
						</p>
						<p className='mt-2 text-xs opacity-80'>
							It preserves <code>parentId</code> links for nested map navigation.
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 gap-2 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2'>
					{Object.keys(campaignData.maps || {}).map((mapKey) => (
						<div
							key={mapKey}
							className='flex items-center justify-between p-3 border border-border rounded bg-background shadow-sm'>
							<div className='flex items-center gap-3'>
								<span className='font-mono text-[10px] bg-muted px-2 py-1 rounded border border-border'>{mapKey}</span>
								<div className='flex flex-col'>
									<span className='text-sm font-medium'>{campaignData.maps[mapKey].metadata?.label}</span>
									{campaignData.maps[mapKey].parentId && (
										<span className='text-[10px] text-muted-foreground'>
											↳ Child of: {campaignData.maps[mapKey].parentId}
										</span>
									)}
								</div>
							</div>

							{status[mapKey] ? (
								<span
									className={`text-xs font-bold flex items-center gap-1 ${
										status[mapKey].success ? 'text-emerald-600' : 'text-red-600'
									}`}>
									{status[mapKey].success ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
									{status[mapKey].msg}
								</span>
							) : (
								<span className='text-xs text-muted-foreground italic opacity-50'>Pending</span>
							)}
						</div>
					))}
				</div>

				<Button
					fullWidth
					variant='primary'
					onClick={handleMigration}
					disabled={isProcessing}
					icon={isProcessing ? RefreshCw : UploadCloud}>
					{isProcessing ? 'Migrating Data...' : 'Start Database Sync'}
				</Button>
			</div>
		</div>
	);
}
