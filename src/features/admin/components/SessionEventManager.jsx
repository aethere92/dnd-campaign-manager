import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Calendar } from 'lucide-react';
import {
	fetchChildRows,
	upsertSessionEvent,
	deleteRow,
	fetchSessionEventsWithRelationships,
} from '@/features/admin/api/adminService';
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS, ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminFormStyles';
import Button from '@/shared/components/ui/Button';
import EventTagger from './EventTagger';

const EVENT_TYPES = [
	'combat',
	'social',
	'quest_started',
	'quest_progressed',
	'travel',
	'location_discovered',
	'location_visited',
	'npc_encountered',
	'faction_discovered',
	'investigation',
	'backstory',
	'discovery',
	'vision',
	'shopping',
	'special_event',
];

export default function SessionEventManager({ sessionId }) {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		if (sessionId) loadEvents();
	}, [sessionId]);

	const loadEvents = async () => {
		setLoading(true);
		try {
			const data = await fetchSessionEventsWithRelationships(sessionId);
			setEvents(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleAddNew = () => {
		const nextOrder = events.length > 0 ? Math.max(...events.map((e) => e.event_order || 0)) + 1 : 1;
		const newEvent = {
			id: `new-${Date.now()}`,
			session_id: sessionId,
			title: '',
			description: '',
			event_type: 'travel',
			event_order: nextOrder,
		};
		setEvents([...events, newEvent]);
		handleEdit(newEvent);
	};

	const handleEdit = (event) => {
		setEditingId(event.id);
		setFormData({ ...event });
	};

	const handleSave = async () => {
		try {
			const { relationships, ...payload } = formData;
			await upsertSessionEvent(payload);
			setEditingId(null);
			loadEvents();
		} catch (e) {
			alert('Error saving event: ' + e.message);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this event?')) return;
		if (String(id).startsWith('new')) {
			setEvents(events.filter((e) => e.id !== id));
			return;
		}
		try {
			await deleteRow('session_events', id);
			loadEvents();
		} catch (e) {
			alert(e.message);
		}
	};

	return (
		<div className={ADMIN_SECTION_CLASS}>
			<div className={`${ADMIN_HEADER_CLASS} flex items-center justify-between`}>
				<span className='flex items-center gap-2'>
					<Calendar size={18} className='text-amber-600' /> Session Timeline
				</span>
				<Button onClick={handleAddNew} size='sm' variant='secondary' icon={Plus}>
					Add Event
				</Button>
			</div>

			<div className='space-y-3'>
				{events.map((evt) => (
					<div key={evt.id} className='group'>
						{editingId === evt.id ? (
							/* --- EDIT MODE --- */
							<div className='bg-muted/30 border border-amber-300 rounded-lg p-4 space-y-4 animate-in fade-in'>
								<div className='flex gap-3'>
									<div className='w-16'>
										<label className={ADMIN_LABEL_CLASS}>Order</label>
										<input
											type='number'
											className={ADMIN_INPUT_CLASS}
											value={formData.event_order}
											onChange={(e) => setFormData({ ...formData, event_order: parseInt(e.target.value) })}
										/>
									</div>
									<div className='flex-1'>
										<label className={ADMIN_LABEL_CLASS}>Title</label>
										<input
											type='text'
											className={`${ADMIN_INPUT_CLASS} font-bold`}
											autoFocus
											value={formData.title}
											onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										/>
									</div>
									<div className='w-1/3'>
										<label className={ADMIN_LABEL_CLASS}>Type</label>
										<select
											className={ADMIN_INPUT_CLASS}
											value={formData.event_type}
											onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}>
											{EVENT_TYPES.map((t) => (
												<option key={t} value={t}>
													{t.replace(/_/g, ' ')}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className={ADMIN_LABEL_CLASS}>Description</label>
									<textarea
										rows={3}
										className={ADMIN_INPUT_CLASS}
										value={formData.description || ''}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									/>
								</div>

								<EventTagger eventId={evt.id} />

								<div className='flex justify-end gap-3 border-t border-border/50 pt-3'>
									<Button
										onClick={() => {
											setEditingId(null);
											loadEvents();
										}}
										variant='ghost'
										icon={X}>
										Cancel
									</Button>
									<Button onClick={handleSave} variant='primary' icon={Save}>
										Save Changes
									</Button>
								</div>
							</div>
						) : (
							/* --- VIEW MODE --- */
							<div className='flex items-start gap-3 p-3 bg-background border border-border rounded-lg hover:border-amber-300 transition-colors'>
								<div className='shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border'>
									{evt.event_order}
								</div>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-1'>
										<span className='text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-muted text-muted-foreground rounded border border-border'>
											{evt.event_type ? evt.event_type.replace(/_/g, ' ') : 'Event'}
										</span>
										<h4 className='font-bold text-sm text-foreground'>{evt.title}</h4>
									</div>
									<p className='text-xs text-muted-foreground line-clamp-2'>{evt.description}</p>
									{evt.relationships && evt.relationships.length > 0 && (
										<div className='flex flex-wrap gap-1.5 mt-1'>
											{evt.relationships.map((rel) => (
												<div
													key={rel.id}
													className='inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-card border border-border text-[10px] text-muted-foreground shadow-sm select-none'>
													<span className='font-medium text-foreground'>{rel.target?.name}</span>
													<span className='text-[9px] opacity-60 uppercase'>{rel.target?.type}</span>
												</div>
											))}
										</div>
									)}
								</div>

								<div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
									<button
										onClick={() => handleEdit(evt)}
										className='p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-md transition-colors'>
										<Edit2 size={18} />
									</button>
									<button
										onClick={() => handleDelete(evt.id)}
										className='p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors'>
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
