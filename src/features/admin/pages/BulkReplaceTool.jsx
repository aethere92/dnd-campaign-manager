import React, { useState } from 'react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { getBulkReplacePreview, executeBulkReplace } from '@/features/admin/api/adminService';
import {
	ADMIN_SECTION_CLASS,
	ADMIN_HEADER_CLASS,
	ADMIN_INPUT_CLASS,
	ADMIN_LABEL_CLASS,
} from '@/features/admin/components/AdminFormStyles';
import Button from '@/shared/components/ui/Button';
import { Replace, Eye, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function BulkReplaceTool() {
	const { campaignId } = useCampaign();
	const queryClient = useQueryClient();
	const [find, setFind] = useState('');
	const [replace, setReplace] = useState('');
	const [preview, setPreview] = useState(null); // null, [], or items
	const [isProcessing, setIsProcessing] = useState(false);

	const handlePreview = async () => {
		setIsProcessing(true);
		const matches = await getBulkReplacePreview(campaignId, find, replace);
		setPreview(matches);
		setIsProcessing(false);
	};

	const handleConfirm = async () => {
		if (!confirm(`Apply all ${preview.length} changes?`)) return;
		setIsProcessing(true);
		await executeBulkReplace(preview);
		queryClient.invalidateQueries();
		alert('Archive successfully patched.');
		setPreview(null);
		setFind('');
		setReplace('');
		setIsProcessing(false);
	};

	return (
		<div className='max-w-4xl mx-auto p-6 space-y-6'>
			<div className={ADMIN_SECTION_CLASS}>
				<h2 className={ADMIN_HEADER_CLASS}>
					<span className='flex items-center gap-2'>
						<Replace size={18} className='text-amber-600' /> Archive Patch Tool
					</span>
				</h2>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className={ADMIN_LABEL_CLASS}>Search Term</label>
						<input
							className={ADMIN_INPUT_CLASS}
							value={find}
							onChange={(e) => setFind(e.target.value)}
							placeholder='Misspelled word...'
						/>
					</div>
					<div>
						<label className={ADMIN_LABEL_CLASS}>Replacement</label>
						<input
							className={ADMIN_INPUT_CLASS}
							value={replace}
							onChange={(e) => setReplace(e.target.value)}
							placeholder='Proper word...'
						/>
					</div>
				</div>

				<div className='pt-2'>
					<Button
						variant='primary'
						fullWidth
						icon={isProcessing ? Loader2 : Eye}
						disabled={isProcessing || !find.trim()}
						onClick={handlePreview}>
						{isProcessing ? 'Scanning...' : 'Scan for Matches'}
					</Button>
				</div>
			</div>

			{preview && (
				<div className={`${ADMIN_SECTION_CLASS} animate-in slide-in-from-bottom-4`}>
					<div className={ADMIN_HEADER_CLASS}>
						<span>Review Proposed Changes ({preview.length})</span>
						<Button size='sm' variant='danger' icon={Replace} onClick={handleConfirm} disabled={preview.length === 0}>
							Apply All Updates
						</Button>
					</div>

					{preview.length === 0 ? (
						<div className='text-center py-10 text-muted-foreground italic'>No matches found in the archives.</div>
					) : (
						<div className='border border-border rounded-lg overflow-hidden bg-background'>
							<table className='w-full text-[11px] text-left border-collapse'>
								<thead className='bg-muted text-muted-foreground font-bold uppercase tracking-wider'>
									<tr>
										<th className='p-3 border-b border-border'>Context / Source</th>
										<th className='p-3 border-b border-border'>Change Preview</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border'>
									{preview.map((item, idx) => (
										<tr key={idx} className='hover:bg-muted/30'>
											<td className='p-3 align-top font-bold text-slate-500 w-1/3'>
												<div className='uppercase text-[9px] opacity-50 mb-1'>
													{item.table}.{item.field}
												</div>
												{item.context}
											</td>
											<td className='p-3 space-y-1'>
												<div className='text-red-600 line-through opacity-60 bg-red-50 p-1 rounded'>
													{item.original}
												</div>
												<div className='flex items-center gap-2 text-emerald-700 font-medium bg-emerald-50 p-1 rounded'>
													<ArrowRight size={10} /> {item.proposal}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
