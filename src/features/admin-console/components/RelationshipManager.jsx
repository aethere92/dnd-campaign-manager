import React, { useEffect, useState, useMemo } from 'react';
import {
	Trash2,
	Link as LinkIcon,
	ArrowRightLeft,
	ArrowRight,
	Save,
	X,
	Edit2,
	Layers,
	EyeOff,
	Shield,
	Sword,
	MapPin,
	Flag,
	User,
	Users,
	Briefcase,
	BookOpen,
	Gem,
	Calendar,
} from 'lucide-react';
import EntitySearch from './EntitySearch';
import { fetchRelationships, addRelationship, deleteRelationship, updateRelationship } from '../../../services/admin';
import { SECTION_CLASS, HEADER_CLASS, INPUT_CLASS } from './ui/FormStyles';
import Button from '../../../components/ui/Button';

// --- CONFIGURATION ---

// 1. Group Headers (By Entity Type)
const ENTITY_GROUPS = {
	character: { label: 'Characters', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
	npc: { label: 'NPCs', icon: User, color: 'text-amber-600', bg: 'bg-amber-50' },
	location: { label: 'Locations', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
	faction: { label: 'Factions', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
	quest: { label: 'Quests', icon: Flag, color: 'text-blue-600', bg: 'bg-blue-50' },
	session: { label: 'Sessions', icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-50' },
	item: { label: 'Items', icon: Gem, color: 'text-indigo-600', bg: 'bg-indigo-50' },
	event: { label: 'Events', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
	default: { label: 'Other Entities', icon: LinkIcon, color: 'text-gray-600', bg: 'bg-gray-50' },
};

const GROUP_ORDER = ['character', 'npc', 'faction', 'location', 'quest', 'item', 'session', 'event'];

// 2. Item Styles (By Relationship Type) - Keeps the "Ally/Enemy" visual context
const REL_STYLES = {
	Ally: { color: 'text-emerald-700', bg: 'bg-emerald-100/50', border: 'border-emerald-400' },
	Friend: { color: 'text-emerald-700', bg: 'bg-emerald-100/50', border: 'border-emerald-400' },
	Enemy: { color: 'text-red-700', bg: 'bg-red-100/50', border: 'border-red-400' },
	Rival: { color: 'text-red-700', bg: 'bg-red-100/50', border: 'border-red-400' },
	Located_In: { color: 'text-amber-700', bg: 'bg-amber-100/50', border: 'border-amber-400' },
	Parent_Location: { color: 'text-amber-700', bg: 'bg-amber-100/50', border: 'border-amber-400' },
	Quest_Giver: { color: 'text-blue-700', bg: 'bg-blue-100/50', border: 'border-blue-400' },
	Participant: { color: 'text-blue-700', bg: 'bg-blue-100/50', border: 'border-blue-400' },
	Generic: { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
};

export default function RelationshipManager({ entityId }) {
	const [relationships, setRelationships] = useState([]);
	const [loading, setLoading] = useState(false);

	// BULK ADD STATE
	const [pendingTargets, setPendingTargets] = useState([]);
	const [type, setType] = useState('Generic');
	const [isBidirectional, setIsBidirectional] = useState(false);
	const [isHidden, setIsHidden] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	// EDIT STATE
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({});

	useEffect(() => {
		if (entityId) loadRelationships();
	}, [entityId]);

	const loadRelationships = async () => {
		setLoading(true);
		try {
			const data = await fetchRelationships(entityId);
			setRelationships(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	// --- GROUPING LOGIC (By Entity Type) ---
	const grouped = useMemo(() => {
		const groups = {};
		relationships.forEach((rel) => {
			// Group by Target Entity Type (e.g. 'npc', 'location')
			const entityType = rel.target?.type?.toLowerCase() || 'default';
			// Map to config key or fallback
			const groupKey = ENTITY_GROUPS[entityType] ? entityType : 'default';

			if (!groups[groupKey]) groups[groupKey] = [];
			groups[groupKey].push(rel);
		});
		return groups;
	}, [relationships]);

	// --- HANDLERS ---
	const handleSelectTarget = (item) => {
		if (pendingTargets.find((t) => t.id === item.id) || item.id === entityId) return;
		setPendingTargets([...pendingTargets, item]);
	};
	const removePending = (id) => setPendingTargets(pendingTargets.filter((t) => t.id !== id));

	const handleBulkAdd = async () => {
		if (pendingTargets.length === 0) return;
		setIsAdding(true);
		try {
			await Promise.all(
				pendingTargets.map((target) =>
					addRelationship({
						from_entity_id: entityId,
						to_entity_id: target.id,
						relationship_type: type,
						is_bidirectional: isBidirectional,
						is_hidden: isHidden,
					})
				)
			);
			setPendingTargets([]);
			setType('Generic');
			loadRelationships();
		} catch (e) {
			alert('Error: ' + e.message);
		} finally {
			setIsAdding(false);
		}
	};

	const handleUpdate = async () => {
		try {
			await updateRelationship(editingId, {
				relationship_type: editForm.relationship_type,
				is_bidirectional: editForm.is_bidirectional,
				is_hidden: editForm.is_hidden,
			});
			setEditingId(null);
			loadRelationships();
		} catch (e) {
			alert(e.message);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Remove link?')) return;
		try {
			await deleteRelationship(id);
			loadRelationships();
		} catch (e) {
			alert(e.message);
		}
	};

	if (!entityId) return null;

	// Dropdown options
	const relationshipTypes = [
		'Generic',
		'parent_location',
		'Quest Update',
		'session_character',
		'session_npc',
		'session_faction',
		'session_location',
		'session_quest',
		'Participant',
		'Ally',
		'Enemy',
		'Located_In',
		'Member_Of',
		'Quest_Giver',
		'Leader_Of',
		'Workplace',
		'Employee',
	];

	// Helper to get sort order including "Other" groups not in explicit list
	const sortedGroupKeys = [...GROUP_ORDER, ...Object.keys(grouped).filter((k) => !GROUP_ORDER.includes(k))];

	return (
		<div className={SECTION_CLASS}>
			<h2 className={`${HEADER_CLASS} flex items-center gap-2`}>
				<LinkIcon size={18} className='text-amber-600' /> Relationships
			</h2>

			{/* --- ADD NEW SECTION --- */}
			<div className='bg-muted/30 p-4 rounded-lg mb-6 border border-border shadow-sm'>
				<div className='flex items-center justify-between mb-3'>
					<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2'>
						<Layers size={12} /> Bulk Connect
					</h3>
					{pendingTargets.length > 0 && (
						<span className='text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100'>
							{pendingTargets.length} Ready
						</span>
					)}
				</div>

				<div className='space-y-4'>
					<div className='w-full'>
						<EntitySearch onSelect={handleSelectTarget} />
					</div>

					{pendingTargets.length > 0 && (
						<div className='flex flex-wrap gap-2 p-3 bg-background border border-border rounded-md'>
							{pendingTargets.map((t) => (
								<div
									key={t.id}
									className='flex items-center gap-2 bg-amber-50 text-amber-900 px-2 py-1 rounded border border-amber-200 text-xs font-medium'>
									<span className='uppercase text-[9px] text-amber-700/60 font-bold'>{t.type}</span>
									<span>{t.name}</span>
									<button onClick={() => removePending(t.id)} className='text-amber-500 hover:text-amber-800'>
										✕
									</button>
								</div>
							))}
						</div>
					)}

					<div className='flex flex-col md:flex-row gap-3 items-end pt-2 border-t border-border/50'>
						<div className='flex-1 w-full grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-[10px] uppercase font-bold text-muted-foreground mb-1'>Type</label>
								<select value={type} onChange={(e) => setType(e.target.value)} className={INPUT_CLASS}>
									{relationshipTypes.map((t) => (
										<option key={t} value={t}>
											{t.replace('_', ' ')}
										</option>
									))}
								</select>
							</div>
							<div className='flex flex-col gap-2 pb-1'>
								<label className='flex items-center gap-2 cursor-pointer select-none'>
									<input
										type='checkbox'
										checked={isBidirectional}
										onChange={(e) => setIsBidirectional(e.target.checked)}
										className='w-4 h-4 text-amber-600 rounded focus:ring-amber-500'
									/>
									<span className='text-xs text-muted-foreground font-medium'>2-Way</span>
								</label>
								<label className='flex items-center gap-2 cursor-pointer select-none'>
									<input
										type='checkbox'
										checked={isHidden}
										onChange={(e) => setIsHidden(e.target.checked)}
										className='w-4 h-4 text-amber-600 rounded focus:ring-amber-500'
									/>
									<span className='text-xs text-muted-foreground font-medium flex items-center gap-1'>
										Hidden <EyeOff size={10} />
									</span>
								</label>
							</div>
						</div>
						<Button
							onClick={handleBulkAdd}
							disabled={pendingTargets.length === 0 || isAdding}
							size='sm'
							variant='primary'
							className='w-full md:w-auto min-w-[100px]'>
							{isAdding ? 'Saving...' : `Add ${pendingTargets.length > 0 ? `(${pendingTargets.length})` : ''}`}
						</Button>
					</div>
				</div>
			</div>

			{/* --- LIST SECTION (GROUPED BY ENTITY TYPE) --- */}
			<div className='space-y-6'>
				{relationships.length === 0 && (
					<div className='p-4 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-lg'>
						No relationships connected.
					</div>
				)}

				{sortedGroupKeys.map((groupKey) => {
					const items = grouped[groupKey];
					if (!items || items.length === 0) return null;

					const groupConfig = ENTITY_GROUPS[groupKey] || ENTITY_GROUPS.default;
					const GroupIcon = groupConfig.icon;

					return (
						<div key={groupKey} className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
							{/* Group Header */}
							<h3
								className={`text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-border/60 pb-1 flex items-center gap-2 ${groupConfig.color} opacity-90`}>
								<GroupIcon size={14} /> {groupConfig.label}
								<span className='ml-auto text-[9px] bg-muted/50 px-1.5 py-0.5 rounded-full text-muted-foreground'>
									{items.length}
								</span>
							</h3>

							<div className='grid grid-cols-1 gap-2'>
								{items.map((rel) => {
									// Item Style based on Relationship Type (Ally/Enemy)
									const style = REL_STYLES[rel.relationship_type] || REL_STYLES.Generic;

									return (
										<div
											key={rel.id}
											className={`group border rounded-lg transition-all bg-background hover:shadow-sm ${
												editingId === rel.id ? 'border-amber-400 ring-1 ring-amber-400' : 'border-border'
											}`}>
											{editingId === rel.id ? (
												/* EDIT MODE */
												<div className='grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center p-2 bg-muted/20'>
													<div className='font-bold text-sm text-foreground truncate min-w-0'>{rel.target?.name}</div>

													<div className='w-36'>
														<select
															className={`${INPUT_CLASS} py-1 h-8 text-xs`}
															value={editForm.relationship_type}
															onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value })}>
															{relationshipTypes.map((t) => (
																<option key={t} value={t}>
																	{t.replace('_', ' ')}
																</option>
															))}
														</select>
													</div>

													<div className='flex flex-col gap-1 px-2'>
														<label className='flex items-center gap-1 cursor-pointer'>
															<input
																type='checkbox'
																checked={editForm.is_bidirectional}
																onChange={(e) => setEditForm({ ...editForm, is_bidirectional: e.target.checked })}
															/>
															<span className='text-[10px] uppercase text-muted-foreground'>2-Way</span>
														</label>
														<label className='flex items-center gap-1 cursor-pointer'>
															<input
																type='checkbox'
																checked={editForm.is_hidden}
																onChange={(e) => setEditForm({ ...editForm, is_hidden: e.target.checked })}
															/>
															<span className='text-[10px] uppercase text-muted-foreground'>Hidden</span>
														</label>
													</div>

													<div className='flex gap-1'>
														<Button onClick={handleUpdate} size='sm' variant='primary' icon={Save} className='h-9 px-3'>
															Save
														</Button>
														<Button
															onClick={() => setEditingId(null)}
															size='sm'
															variant='ghost'
															icon={X}
															className='h-9 px-3'>
															Cancel
														</Button>
													</div>
												</div>
											) : (
												/* VIEW MODE */
												<div
													className={`flex items-center justify-between p-2 pl-0 border-l-[3px] ${style.border.replace(
														'border',
														'border-l'
													)}`}>
													<div className='flex items-center gap-3 min-w-0 pl-3'>
														<div className='min-w-0'>
															<div className='flex items-center gap-2'>
																<span className='text-sm font-bold text-foreground truncate'>{rel.target?.name}</span>
																{rel.is_hidden && <EyeOff size={14} className='text-gray-400' title='Hidden' />}
																{rel.is_bidirectional && (
																	<ArrowRightLeft
																		size={12}
																		className='text-muted-foreground/50'
																		title='Bidirectional'
																	/>
																)}
															</div>
															<div className='flex items-center gap-1.5 mt-0.5'>
																{/* Relationship Type Badge */}
																<span
																	className={`text-[10px] font-bold uppercase px-1.5 py-0 rounded-sm ${style.bg} ${style.color} border border-transparent`}>
																	{rel.relationship_type.replace('_', ' ')}
																</span>
															</div>
														</div>
													</div>
													<div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2'>
														<button
															onClick={() => {
																setEditingId(rel.id);
																setEditForm({
																	relationship_type: rel.relationship_type,
																	is_bidirectional: rel.is_bidirectional,
																	is_hidden: rel.is_hidden,
																});
															}}
															className='p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'>
															<Edit2 size={18} />
														</button>
														<button
															onClick={() => handleDelete(rel.id)}
															className='p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'>
															<Trash2 size={18} />
														</button>
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
