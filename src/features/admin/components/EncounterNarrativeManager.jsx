import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, BookOpen } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import MarkdownEditor from './MarkdownEditor';
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS, ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminFormStyles';

export default function EncounterNarrativeManager({ timeline =[], onChange }) {
	const [editingIndex, setEditingIndex] = useState(null);
	const [formData, setFormData] = useState({});

	const handleAddNew = () => {
		const lastEvent = timeline[timeline.length - 1];
		const nextRound = lastEvent ? lastEvent.round : 1;
		const nextOrder = lastEvent ? lastEvent.order + 1 : 1;

		const newEvent = { round: nextRound, order: nextOrder, description: '' };
		const newList = [...timeline, newEvent];
		onChange(newList);
		setEditingIndex(newList.length - 1);
		setFormData(newEvent);
	};

	const handleEdit = (idx) => {
		setEditingIndex(idx);
		setFormData({ ...timeline[idx] });
	};

	const handleSave = () => {
		const newList = [...timeline];
		newList[editingIndex] = formData;
		// Ensure items remain correctly ordered when saved
		newList.sort((a, b) => {
			if (a.round !== b.round) return a.round - b.round;
			return a.order - b.order;
		});
		onChange(newList);
		setEditingIndex(null);
	};

	const handleDelete = (idx) => {
		if (!confirm('Delete this event?')) return;
		const newList = timeline.filter((_, i) => i !== idx);
		onChange(newList);
	};

	// Group by round strictly for the UI rendering
	const grouped = timeline.reduce((acc, curr, idx) => {
		if (!acc[curr.round]) acc[curr.round] = [];
		acc[curr.round].push({ ...curr, originalIndex: idx });
		return acc;
	}, {});

	return (
		<div className={ADMIN_SECTION_CLASS}>
			<div className={`${ADMIN_HEADER_CLASS} flex justify-between`}>
				<span className='flex items-center gap-2'>
					<BookOpen size={18} className='text-primary' /> Narrative Timeline
				</span>
				<Button onClick={handleAddNew} size='sm' variant='secondary' icon={Plus}>
					Add Event
				</Button>
			</div>

			<div className='space-y-6'>
				{Object.keys(grouped).length === 0 && (
					<div className='text-center py-6 text-muted-foreground text-sm italic'>
						No narrative events recorded yet.
					</div>
				)}

				{Object.entries(grouped).map(([roundNum, events]) => (
					<div key={roundNum} className='space-y-3'>
						<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1'>
							Round {roundNum}
						</h4>
						
						{events.map((evt) => (
							<div key={evt.originalIndex} className='group'>
								{editingIndex === evt.originalIndex ? (
									<div className='bg-muted/30 border border-primary/30 rounded-lg p-4 space-y-4 animate-in fade-in shadow-sm'>
										<div className='flex gap-4'>
											<div className='w-20'>
												<label className={ADMIN_LABEL_CLASS}>Round</label>
												<input
													type='number'
													className={ADMIN_INPUT_CLASS}
													value={formData.round || ''}
													onChange={(e) => setFormData({ ...formData, round: parseInt(e.target.value) || 1 })}
												/>
											</div>
											<div className='w-20'>
												<label className={ADMIN_LABEL_CLASS}>Order</label>
												<input
													type='number'
													className={ADMIN_INPUT_CLASS}
													value={formData.order || ''}
													onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
												/>
											</div>
										</div>
										<div>
											<MarkdownEditor
												label='Event Description'
												value={formData.description || ''}
												onChange={(e) => setFormData({ ...formData, description: e.target.value })}
												placeholder='Use [[entity_id]] to link entities...'
											/>
										</div>
										<div className='flex justify-end gap-2 pt-2'>
											<Button onClick={() => setEditingIndex(null)} variant='ghost' size='sm' icon={X}>
												Cancel
											</Button>
											<Button onClick={handleSave} variant='primary' size='sm' icon={Save}>
												Save Event
											</Button>
										</div>
									</div>
								) : (
									<div className='flex items-start gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors shadow-sm'>
										<div className='shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border mt-0.5 shadow-inner'>
											{evt.order}
										</div>
										<div className='flex-1 min-w-0 pt-1'>
											<p className='text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-serif'>
												{evt.description}
											</p>
										</div>
										<div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
											<button
												onClick={() => handleEdit(evt.originalIndex)}
												className='p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-md transition-colors'
											>
												<Edit2 size={16} />
											</button>
											<button
												onClick={() => handleDelete(evt.originalIndex)}
												className='p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors'
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}