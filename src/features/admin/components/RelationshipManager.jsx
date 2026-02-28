import React, { useEffect, useState, useMemo } from 'react';
import {
	Trash2,
	Link as LinkIcon,
	ArrowRightLeft,
	Save,
	X,
	Edit2,
	EyeOff,
	Shield,
	MapPin,
	Flag,
	User,
	Users,
	BookOpen,
	Gem,
	Calendar,
} from 'lucide-react';
import EntitySearch from '@/features/admin/components/EntitySearch';
import {
	fetchRelationships,
	addRelationship,
	deleteRelationship,
	updateRelationship,
} from '@/features/admin/api/adminService';
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS } from './AdminFormStyles';
import Button from '@/shared/components/ui/Button';
import { RELATIONSHIP_TYPES } from '@/features/admin/config/relationshipTypes';

// --- CONFIGURATION ---

// 1. Group Headers (By Entity Type)
const ENTITY_GROUPS = {
	character: { label: 'Characters', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
	npc: { label: 'NPCs', icon: User, color: 'text-amber-600', bg: 'bg-amber-500/10' },
	location: { label: 'Locations', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
	faction: { label: 'Factions', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-500/10' },
	quest: { label: 'Quests', icon: Flag, color: 'text-blue-600', bg: 'bg-blue-500/10' },
	session: { label: 'Sessions', icon: BookOpen, color: 'text-slate-600', bg: 'bg-muted/30' },
	item: { label: 'Items', icon: Gem, color: 'text-indigo-600', bg: 'bg-indigo-50' },
	event: { label: 'Events', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
	default: { label: 'Other Entities', icon: LinkIcon, color: 'text-muted-foreground', bg: 'bg-muted/30' },
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
	Generic: { color: 'text-slate-600', bg: 'bg-muted', border: 'border-slate-300' },
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

	// Dropdown options use shared config
	const relationshipTypes = RELATIONSHIP_TYPES;

	// Helper to get sort order including "Other" groups not in explicit list
	const sortedGroupKeys = [...GROUP_ORDER, ...Object.keys(grouped).filter((k) => !GROUP_ORDER.includes(k))];

	return (
		<div className={ADMIN_SECTION_CLASS}>
			<h2 className={`${ADMIN_HEADER_CLASS} flex items-center gap-2`}>
				<LinkIcon size={18} className='text-amber-600' /> Relationships
			</h2>

			{/* --- ADD BAR --- */}
			<div className='space-y-2 mb-4'>
				<div className='flex items-center gap-2'>
					<div className='flex-1'>
						<EntitySearch onSelect={handleSelectTarget} />
					</div>

					<select
						value={type}
						onChange={(e) => setType(e.target.value)}
						className='h-[38px] text-[11px] rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary outline-none w-36 shrink-0'
						title='Relationship type'>
						{relationshipTypes.map((t) => (
							<option key={t} value={t}>
								{t.replaceAll('_', ' ')}
							</option>
						))}
					</select>

					<label className='flex items-center gap-1 cursor-pointer shrink-0' title='Bidirectional'>
						<input
							type='checkbox'
							checked={isBidirectional}
							onChange={(e) => setIsBidirectional(e.target.checked)}
							className='w-3.5 h-3.5 rounded'
						/>
						<ArrowRightLeft size={13} className='text-muted-foreground' />
					</label>

					<label className='flex items-center gap-1 cursor-pointer shrink-0' title='Hidden'>
						<input
							type='checkbox'
							checked={isHidden}
							onChange={(e) => setIsHidden(e.target.checked)}
							className='w-3.5 h-3.5 rounded'
						/>
						<EyeOff size={13} className='text-muted-foreground' />
					</label>

					<Button
						onClick={handleBulkAdd}
						disabled={pendingTargets.length === 0 || isAdding}
						size='sm'
						variant='primary'
						className='shrink-0 h-[38px] px-3'>
						{isAdding ? '...' : `Add${pendingTargets.length > 0 ? ` (${pendingTargets.length})` : ''}`}
					</Button>
				</div>

				{pendingTargets.length > 0 && (
					<div className='flex flex-wrap gap-1.5'>
						{pendingTargets.map((t) => (
							<div
								key={t.id}
								className='flex items-center gap-1.5 bg-amber-500/10 text-amber-900 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200'>
								<span className='uppercase text-[9px] text-amber-700/60 font-bold'>{t.type}</span>
								{t.name}
								<button onClick={() => removePending(t.id)} className='text-amber-500 hover:text-amber-800 ml-0.5'>
									<X size={11} />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* --- LIST SECTION (GROUPED BY ENTITY TYPE) --- */}
			<div className='space-y-3'>
				{relationships.length === 0 && (
					<div className='p-3 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-lg'>
						No relationships connected.
					</div>
				)}

				{sortedGroupKeys.map((groupKey) => {
					const items = grouped[groupKey];
					if (!items || items.length === 0) return null;

					const groupConfig = ENTITY_GROUPS[groupKey] || ENTITY_GROUPS.default;
					const GroupIcon = groupConfig.icon;

					return (
						<div key={groupKey}>
							{/* Group Header */}
							<h3
								className={`text-[10px] font-bold uppercase tracking-widest mb-1 border-b border-border/40 pb-1 flex items-center gap-1.5 ${groupConfig.color} opacity-80`}>
								<GroupIcon size={12} /> {groupConfig.label}
								<span className='ml-auto text-[9px] bg-muted/50 px-1.5 py-0.5 rounded-full text-muted-foreground'>
									{items.length}
								</span>
							</h3>

							<div className='grid grid-cols-1 gap-0 divide-y divide-border/40'>
								{items.map((rel) => {
									const style = REL_STYLES[rel.relationship_type] || REL_STYLES.Generic;

									return (
										<div key={rel.id} className='group'>
											{editingId === rel.id ? (
												/* EDIT MODE — single line */
												<div className='flex items-center gap-2 py-1.5 px-2 bg-amber-500/5'>
													<span className='text-xs font-bold text-foreground truncate min-w-0 shrink-1 w-36'>
														{rel.target?.name}
													</span>

													<select
														className='h-7 text-[11px] rounded border border-input bg-background px-1.5 focus:ring-1 focus:ring-primary outline-none w-36 shrink-0'
														value={editForm.relationship_type}
														onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value })}>
														{relationshipTypes.map((t) => (
															<option key={t} value={t}>
																{t.replaceAll('_', ' ')}
															</option>
														))}
													</select>

													<label className='flex items-center gap-1 cursor-pointer shrink-0' title='Bidirectional'>
														<input
															type='checkbox'
															checked={editForm.is_bidirectional}
															onChange={(e) => setEditForm({ ...editForm, is_bidirectional: e.target.checked })}
															className='w-3.5 h-3.5 rounded'
														/>
														<ArrowRightLeft size={11} className='text-muted-foreground' />
													</label>

													<label className='flex items-center gap-1 cursor-pointer shrink-0' title='Hidden'>
														<input
															type='checkbox'
															checked={editForm.is_hidden}
															onChange={(e) => setEditForm({ ...editForm, is_hidden: e.target.checked })}
															className='w-3.5 h-3.5 rounded'
														/>
														<EyeOff size={11} className='text-muted-foreground' />
													</label>

													<div className='flex gap-0.5 ml-auto shrink-0'>
														<button
															type='button'
															onClick={handleUpdate}
															className='p-1 text-emerald-600 hover:bg-emerald-500/10 rounded transition-colors'
															title='Save'>
															<Save size={14} />
														</button>
														<button
															type='button'
															onClick={() => setEditingId(null)}
															className='p-1 text-muted-foreground hover:bg-muted rounded transition-colors'
															title='Cancel'>
															<X size={14} />
														</button>
													</div>
												</div>
											) : (
												/* VIEW MODE — compact row */
												<div className='flex items-center gap-2 py-1 px-2 hover:bg-muted/30 transition-colors'>
													<span className='text-xs font-bold text-foreground truncate min-w-0 flex-1'>
														{rel.target?.name}
													</span>

													<span
														className={`text-[9px] font-bold uppercase px-1.5 py-0 rounded-sm shrink-0 ${style.bg} ${style.color}`}>
														{rel.relationship_type.replaceAll('_', ' ')}
													</span>

													{rel.is_bidirectional && (
														<ArrowRightLeft size={11} className='text-muted-foreground/50 shrink-0' title='Bidirectional' />
													)}
													{rel.is_hidden && (
														<EyeOff size={11} className='text-muted-foreground/50 shrink-0' title='Hidden' />
													)}

													<div className='flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
														<button
															onClick={() => {
																setEditingId(rel.id);
																setEditForm({
																	relationship_type: rel.relationship_type,
																	is_bidirectional: rel.is_bidirectional,
																	is_hidden: rel.is_hidden,
																});
															}}
															className='p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded transition-colors'
															title='Edit'>
															<Edit2 size={13} />
														</button>
														<button
															onClick={() => handleDelete(rel.id)}
															className='p-1 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded transition-colors'
															title='Delete'>
															<Trash2 size={13} />
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
