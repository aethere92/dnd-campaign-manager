import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Target, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { fetchChildRows, upsertQuestObjective, deleteRow, getSessionList } from '@/features/admin/api/adminService'; // Import getSessionList
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS, ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminFormStyles';
import { useCampaign } from '@/features/campaign/CampaignContext';
import Button from '@/shared/components/ui/Button';

export default function QuestObjectiveManager({ questId }) {
	const { campaignId } = useCampaign();
	const [objectives, setObjectives] = useState([]);
	const [sessions, setSessions] = useState([]); // Store session options
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		if (questId) {
			loadObjectives();
			loadSessions();
		}
	}, [questId]);

	const loadObjectives = async () => {
		setLoading(true);
		try {
			const data = await fetchChildRows('quest_objectives', 'quest_id', questId, 'order_index');
			setObjectives(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const loadSessions = async () => {
		if (!campaignId) return;
		try {
			const data = await getSessionList(campaignId);
			setSessions(data);
		} catch (e) {
			console.error('Failed to load sessions', e);
		}
	};

	const handleAddNew = () => {
		const nextOrder = objectives.length > 0 ? Math.max(...objectives.map((o) => o.order_index || 0)) + 1 : 1;
		const newObj = {
			id: `new-${Date.now()}`,
			quest_id: questId,
			objective_name: '', // Title
			description: '',
			objective_update: '', // Resolution text
			status: 'pending',
			order_index: nextOrder,
			completed_session_id: null,
		};
		setObjectives([...objectives, newObj]);
		handleEdit(newObj);
	};

	const handleEdit = (obj) => {
		setEditingId(obj.id);
		setFormData({ ...obj });
	};

	const handleSave = async () => {
		try {
			await upsertQuestObjective(formData);
			setEditingId(null);
			loadObjectives();
		} catch (e) {
			alert(e.message);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete?')) return;
		if (String(id).startsWith('new')) {
			setObjectives(objectives.filter((o) => o.id !== id));
			return;
		}
		try {
			await deleteRow('quest_objectives', id);
			loadObjectives();
		} catch (e) {
			alert(e.message);
		}
	};

	return (
		<div className={ADMIN_SECTION_CLASS}>
			<div className={`${ADMIN_HEADER_CLASS} flex justify-between`}>
				<span className='flex items-center gap-2'>
					<Target size={18} className='text-blue-600' /> Objectives
				</span>
				<Button onClick={handleAddNew} size='sm' variant='secondary' icon={Plus}>
					Add Objective
				</Button>
			</div>

			<div className='space-y-3'>
				{objectives.map((obj) => (
					<div key={obj.id} className='group'>
						{editingId === obj.id ? (
							/* --- EDIT MODE --- */
							<div className='bg-muted/30 border border-blue-300 rounded-lg p-4 space-y-4 animate-in fade-in'>
								{/* Row 1: Order, Title, Status */}
								<div className='flex gap-3'>
									<div className='w-16'>
										<label className={ADMIN_LABEL_CLASS}>#</label>
										<input
											type='number'
											className={ADMIN_INPUT_CLASS}
											value={formData.order_index}
											onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
										/>
									</div>
									<div className='flex-1'>
										<label className={ADMIN_LABEL_CLASS}>Title (Name)</label>
										<input
											type='text'
											className={`${ADMIN_INPUT_CLASS} font-bold`}
											autoFocus
											value={formData.objective_name || ''}
											onChange={(e) => setFormData({ ...formData, objective_name: e.target.value })}
											placeholder='Short summary...'
										/>
									</div>
									<div className='w-32'>
										<label className={ADMIN_LABEL_CLASS}>Status</label>
										<select
											className={ADMIN_INPUT_CLASS}
											value={formData.status}
											onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
											<option value='pending'>Pending</option>
											<option value='completed'>Completed</option>
											<option value='failed'>Failed</option>
										</select>
									</div>
								</div>

								{/* Row 2: Description */}
								<div>
									<label className={ADMIN_LABEL_CLASS}>Description</label>
									<textarea
										rows={2}
										className={ADMIN_INPUT_CLASS}
										value={formData.description || ''}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										placeholder='What needs to be done?'
									/>
								</div>

								{/* Row 3: Updates & Session */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/50 pt-3'>
									<div>
										<label className={ADMIN_LABEL_CLASS}>Resolution / Update Text</label>
										<textarea
											rows={2}
											className={ADMIN_INPUT_CLASS}
											value={formData.objective_update || ''}
											onChange={(e) => setFormData({ ...formData, objective_update: e.target.value })}
											placeholder='How was it resolved?'
										/>
									</div>
									<div>
										<label className={ADMIN_LABEL_CLASS}>Completed In Session</label>
										<select
											className={ADMIN_INPUT_CLASS}
											value={formData.completed_session_id || ''}
											onChange={(e) => setFormData({ ...formData, completed_session_id: e.target.value || null })}>
											<option value=''>-- None --</option>
											{sessions.map((s) => (
												<option key={s.id} value={s.id}>
													{s.title}
												</option>
											))}
										</select>
									</div>
								</div>

								<div className='flex justify-end gap-2 pt-2'>
									<Button
										onClick={() => {
											setEditingId(null);
											loadObjectives();
										}}
										variant='ghost'
										size='sm'
										icon={X}>
										Cancel
									</Button>
									<Button onClick={handleSave} variant='primary' size='sm' icon={Save}>
										Save Objective
									</Button>
								</div>
							</div>
						) : (
							/* --- VIEW MODE --- */
							<div
								className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
									obj.status === 'completed'
										? 'bg-emerald-50/50 border-emerald-200'
										: 'bg-background border-border hover:border-blue-300'
								}`}>
								<span className='font-mono text-xs font-bold opacity-40 w-5 mt-1'>#{obj.order_index}</span>

								<div className='shrink-0 mt-0.5'>
									{obj.status === 'completed' ? (
										<CheckCircle2 size={18} className='text-emerald-600' />
									) : (
										<Circle size={18} className='text-muted-foreground' />
									)}
								</div>

								<div className='flex-1 min-w-0'>
									{obj.objective_name && (
										<div className='font-bold text-sm text-foreground mb-0.5'>{obj.objective_name}</div>
									)}
									<div
										className={`text-sm ${obj.status === 'completed' ? 'text-muted-foreground' : 'text-foreground'}`}>
										{obj.description}
									</div>

									{/* Resolution & Session Badges */}
									{(obj.objective_update || obj.completed_session_id) && (
										<div className='mt-2 flex flex-col gap-1'>
											{obj.objective_update && (
												<div className='text-xs text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded border border-emerald-100 italic'>
													"{obj.objective_update}"
												</div>
											)}
											{obj.completed_session_id && (
												<div className='flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground'>
													<Calendar size={10} />
													Session: {sessions.find((s) => s.id === obj.completed_session_id)?.title || 'Unknown'}
												</div>
											)}
										</div>
									)}
								</div>

								<div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
									<button
										onClick={() => handleEdit(obj)}
										className='p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
										title='Edit Event'>
										<Edit2 size={18} />
									</button>
									<button
										onClick={() => handleDelete(obj.id)}
										className='p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
										title='Delete Event'>
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						)}
					</div>
				))}

				{objectives.length === 0 && !loading && (
					<div className='text-center py-6 text-muted-foreground text-sm italic'>No objectives defined yet.</div>
				)}
			</div>
		</div>
	);
}
