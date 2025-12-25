import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Swords, Skull, Target, Zap, HeartHandshake } from 'lucide-react'; // Added HeartHandshake
import { fetchEncounterActions, upsertEncounterAction, deleteRow } from '../../../services/admin';
import { SECTION_CLASS, HEADER_CLASS, INPUT_CLASS, LABEL_CLASS } from './ui/FormStyles';
import EntitySearch from './EntitySearch';
import Button from '../../../components/ui/Button';

export default function EncounterActionManager({ encounterId }) {
	const [actions, setActions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		if (encounterId) loadActions();
	}, [encounterId]);

	const loadActions = async () => {
		setLoading(true);
		try {
			const data = await fetchEncounterActions(encounterId);
			setActions(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleAddNew = () => {
		const lastAction = actions[actions.length - 1];
		const nextRound = lastAction ? lastAction.round_number : 1;
		const nextOrder = lastAction ? lastAction.action_order + 1 : 1;

		const newAction = {
			id: `new-${Date.now()}`,
			encounter_id: encounterId,
			round_number: nextRound,
			action_order: nextOrder,
			actor_name: '',
			action_description: '',
			action_type: 'attack',
			result: '',
			effect: '',
			is_friendly: false, // Default to hostile
		};
		setActions([...actions, newAction]);
		handleEdit(newAction);
	};

	const handleEdit = (action) => {
		setEditingId(action.id);
		setFormData({ ...action });
	};

	const handleSave = async () => {
		try {
			await upsertEncounterAction(formData);
			setEditingId(null);
			loadActions();
		} catch (e) {
			alert('Error saving action: ' + e.message);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this turn?')) return;
		if (String(id).startsWith('new')) {
			setActions(actions.filter((a) => a.id !== id));
			return;
		}
		try {
			await deleteRow('encounter_actions', id);
			loadActions();
		} catch (e) {
			alert(e.message);
		}
	};

	const setActor = (entity) =>
		setFormData((prev) => ({ ...prev, actor_entity_id: entity.id, actor_name: entity.name }));
	const setTarget = (entity) =>
		setFormData((prev) => ({ ...prev, target_entity_id: entity.id, target_name: entity.name }));

	return (
		<div className={SECTION_CLASS}>
			<div className={`${HEADER_CLASS} flex items-center justify-between`}>
				<span className='flex items-center gap-2'>
					<Swords size={18} className='text-red-600' /> Combat Tracker
				</span>
				<Button onClick={handleAddNew} size='sm' variant='secondary' icon={Plus}>
					Add Turn
				</Button>
			</div>

			<div className='space-y-4'>
				{actions.map((action) => {
					const isFriendly = action.is_friendly;
					const theme = isFriendly
						? {
								border: 'border-emerald-200 hover:border-emerald-300',
								bg: 'bg-emerald-50/20',
								accentText: 'text-emerald-700',
								badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
						  }
						: {
								border: 'border-red-200 hover:border-red-300',
								bg: 'bg-background',
								accentText: 'text-red-700',
								badge: 'bg-red-50 text-red-700 border-red-100',
						  };

					return (
						<div key={action.id} className='group'>
							{editingId === action.id ? (
								/* --- EDIT MODE --- */
								<div className='bg-muted/30 border border-border rounded-lg p-4 space-y-3 animate-in fade-in shadow-sm'>
									{/* Row 1: Timing & Type */}
									<div className='flex gap-3 items-end'>
										<div className='w-16'>
											<label className={LABEL_CLASS}>Round</label>
											<input
												type='number'
												className={INPUT_CLASS}
												value={formData.round_number}
												onChange={(e) => setFormData({ ...formData, round_number: e.target.value })}
											/>
										</div>
										<div className='w-16'>
											<label className={LABEL_CLASS}>Order</label>
											<input
												type='number'
												className={INPUT_CLASS}
												value={formData.action_order}
												onChange={(e) => setFormData({ ...formData, action_order: e.target.value })}
											/>
										</div>
										<div className='flex-1'>
											<label className={LABEL_CLASS}>Action Type</label>
											<select
												className={INPUT_CLASS}
												value={formData.action_type || 'attack'}
												onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}>
												<option value='attack'>Attack</option>
												<option value='action'>Action</option>
												<option value='bonus_action'>Bonus Action</option>
												<option value='spell'>Spell</option>
												<option value='move'>Movement</option>
												<option value='item'>Item Interaction</option>
												<option value='check'>Skill Check</option>
												<option value='save'>Saving Throw</option>
												<option value='legendary'>Legendary Action</option>
												<option value='lair'>Lair Action</option>
											</select>
										</div>
										<label className='flex items-center gap-2 cursor-pointer select-none border border-border rounded-md px-3 py-2 bg-background h-[38px] hover:border-emerald-300 transition-colors'>
											<input
												type='checkbox'
												checked={formData.is_friendly || false}
												onChange={(e) => setFormData({ ...formData, is_friendly: e.target.checked })}
												className='w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer'
											/>
											<span className='text-xs font-bold text-foreground'>Friendly?</span>
										</label>
									</div>

									{/* Row 2: Actor & Target */}
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<label className={LABEL_CLASS}>Actor (Who?)</label>
											{formData.actor_entity_id ? (
												<div className='flex gap-2 items-center'>
													<input
														className={`${INPUT_CLASS} bg-emerald-50 font-medium`}
														readOnly
														value={formData.actor_name || 'Linked Entity'}
													/>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => setFormData({ ...formData, actor_entity_id: null, actor_name: '' })}>
														Change
													</Button>
												</div>
											) : (
												<div className='space-y-1'>
													<EntitySearch onSelect={setActor} />
													<input
														type='text'
														placeholder='Or type manual name...'
														className={INPUT_CLASS}
														value={formData.actor_name || ''}
														onChange={(e) => setFormData({ ...formData, actor_name: e.target.value })}
													/>
												</div>
											)}
										</div>

										<div>
											<label className={LABEL_CLASS}>Target (Whom?)</label>
											{formData.target_entity_id ? (
												<div className='flex gap-2 items-center'>
													<input
														className={`${INPUT_CLASS} bg-red-50 font-medium`}
														readOnly
														value={formData.target_name || 'Linked Entity'}
													/>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => setFormData({ ...formData, target_entity_id: null, target_name: '' })}>
														Change
													</Button>
												</div>
											) : (
												<div className='space-y-1'>
													<EntitySearch onSelect={setTarget} />
													<input
														type='text'
														placeholder='Or type manual name...'
														className={INPUT_CLASS}
														value={formData.target_name || ''}
														onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
													/>
												</div>
											)}
										</div>
									</div>

									{/* Row 3: Description */}
									<div>
										<label className={LABEL_CLASS}>Description</label>
										<textarea
											rows={2}
											className={INPUT_CLASS}
											value={formData.action_description || ''}
											onChange={(e) => setFormData({ ...formData, action_description: e.target.value })}
											placeholder='Uses Multiattack...'
										/>
									</div>

									{/* Row 4: Result & Effect */}
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<label className={LABEL_CLASS}>Result (Hit/Miss/Save)</label>
											<input
												type='text'
												className={INPUT_CLASS}
												value={formData.result || ''}
												onChange={(e) => setFormData({ ...formData, result: e.target.value })}
												placeholder='e.g., Hit (24), Crit, Failed Save'
											/>
										</div>
										<div>
											<label className={LABEL_CLASS}>Effect (Damage/Status)</label>
											<input
												type='text'
												className={INPUT_CLASS}
												value={formData.effect || ''}
												onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
												placeholder='e.g., 23 slashing dmg, Prone'
											/>
										</div>
									</div>

									<div className='flex justify-end gap-3 pt-2'>
										<Button
											onClick={() => {
												setEditingId(null);
												loadActions();
											}}
											variant='ghost'
											size='sm'
											icon={X}>
											Cancel
										</Button>
										<Button onClick={handleSave} variant='primary' size='sm' icon={Save}>
											Save Turn
										</Button>
									</div>
								</div>
							) : (
								/* --- VIEW MODE --- */
								<div
									className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${theme.bg} ${theme.border}`}>
									<div className='flex flex-col items-center justify-center w-10 shrink-0'>
										<span className='text-[9px] font-bold uppercase text-muted-foreground'>Round</span>
										<span className={`text-lg font-serif font-bold ${theme.accentText}`}>{action.round_number}</span>
									</div>

									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2 mb-1 flex-wrap'>
											<span className='text-sm font-bold text-foreground'>{action.actor_name || 'Unknown Actor'}</span>

											{/* Friendly/Hostile Icon Indicator */}
											{isFriendly ? (
												<HeartHandshake size={14} className='text-emerald-500' title='Friendly Action' />
											) : (
												<span className='text-[10px] uppercase tracking-wider text-muted-foreground'>used</span>
											)}

											<span className={`px-1.5 py-0.5 border rounded text-[10px] font-bold uppercase ${theme.badge}`}>
												{action.action_type}
											</span>
											{action.target_name && (
												<>
													<span className='text-[10px] text-muted-foreground'>on</span>
													<span className='text-sm font-medium text-foreground'>{action.target_name}</span>
												</>
											)}
										</div>

										<p className='text-xs text-muted-foreground mb-1'>{action.action_description}</p>

										<div className='flex items-center gap-2 mt-2'>
											{action.result && (
												<div className='flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200'>
													<Target size={12} /> {action.result}
												</div>
											)}
											{action.effect && (
												<div className='flex items-center gap-1.5 text-xs font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-100'>
													<Zap size={12} /> {action.effect}
												</div>
											)}
										</div>
									</div>

									<div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
										<button
											onClick={() => handleEdit(action)}
											className='p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'>
											<Edit2 size={16} />
										</button>
										<button
											onClick={() => handleDelete(action.id)}
											className='p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							)}
						</div>
					);
				})}

				{actions.length === 0 && !loading && (
					<div className='text-center py-8 text-muted-foreground text-sm italic'>No combat turns recorded yet.</div>
				)}
			</div>
		</div>
	);
}
