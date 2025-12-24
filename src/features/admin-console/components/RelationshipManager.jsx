import React, { useEffect, useState } from 'react';
import { Trash2, Link as LinkIcon, ArrowRightLeft, ArrowRight, Save, X, Edit2, Layers, EyeOff } from 'lucide-react'; // Add EyeOff
import EntitySearch from './EntitySearch';
import { fetchRelationships, addRelationship, deleteRelationship, updateRelationship } from '../../../services/admin';
import { SECTION_CLASS, HEADER_CLASS, INPUT_CLASS } from './ui/FormStyles';
import Button from '../../../components/ui/Button';

export default function RelationshipManager({ entityId }) {
	const [relationships, setRelationships] = useState([]);
	const [loading, setLoading] = useState(false);

	// BULK ADD STATE
	const [pendingTargets, setPendingTargets] = useState([]);
	const [type, setType] = useState('Generic');
	const [isBidirectional, setIsBidirectional] = useState(false);
	const [isHidden, setIsHidden] = useState(false); // NEW STATE
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

	// ... handleSelectTarget, removePending ... (Keep existing)
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
						is_hidden: isHidden, // NEW
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
				is_hidden: editForm.is_hidden, // NEW
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

	const relationshipTypes = [
		'Generic',
		'Ally',
		'Enemy',
		'Located_In',
		'Member_Of',
		'Quest_Giver',
		'Participant',
		'Leader_Of',
		'Parent_Location',
		'Workplace',
		'Employee',
		'Quest Update',
		'Location Of',
	];

	return (
		<div className={SECTION_CLASS}>
			<h2 className={`${HEADER_CLASS} flex items-center gap-2`}>
				<LinkIcon size={18} className='text-amber-600' /> Relationships
			</h2>

			{/* --- ADD NEW SECTION --- */}
			<div className='bg-muted/30 p-4 rounded-lg mb-6 border border-border shadow-sm'>
				{/* ... Staging Area Code (Same as previous) ... */}
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

					{/* Pending Chips */}
					{pendingTargets.length > 0 && (
						<div className='flex flex-wrap gap-2 p-3 bg-background border border-border rounded-md'>
							{pendingTargets.map((t) => (
								<div
									key={t.id}
									className='flex items-center gap-2 bg-amber-50 text-amber-900 px-2 py-1 rounded border border-amber-200 text-xs font-medium'>
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
											{t}
										</option>
									))}
								</select>
							</div>
							{/* CHECKBOXES */}
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

			{/* --- LIST SECTION --- */}
			<div className='space-y-2'>
				{relationships.map((rel) => (
					<div
						key={rel.id}
						className={`group border rounded-lg transition-all ${
							editingId === rel.id
								? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
								: 'bg-background border-border hover:border-amber-300'
						}`}>
						{editingId === rel.id ? (
							/* EDIT MODE */
							<div className='grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center p-2'>
								<div className='font-bold text-sm text-foreground truncate min-w-0' title={rel.target?.name}>
									{rel.target?.name}
								</div>

								<div className='w-32'>
									<select
										className={`${INPUT_CLASS} py-1 h-8 text-xs`}
										value={editForm.relationship_type}
										onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value })}>
										{relationshipTypes.map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
								</div>

								<div className='flex flex-col gap-1'>
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

								{/* FIXED: Larger buttons */}
								<div className='flex gap-1'>
									<Button onClick={handleUpdate} size='sm' variant='primary' icon={Save} className='h-9 px-3'>
										Save
									</Button>
									<Button onClick={() => setEditingId(null)} size='sm' variant='ghost' icon={X} className='h-9 px-3'>
										Cancel
									</Button>
								</div>
							</div>
						) : (
							/* VIEW MODE */
							<div className='flex items-center justify-between p-2 pl-3'>
								<div className='flex items-center gap-3 min-w-0'>
									<span
										className={`shrink-0 p-1.5 rounded-md ${
											rel.is_bidirectional ? 'bg-blue-50 text-blue-600' : 'bg-muted text-muted-foreground'
										}`}>
										{rel.is_bidirectional ? <ArrowRightLeft size={16} /> : <ArrowRight size={16} />}
									</span>
									<div className='min-w-0'>
										<div className='flex items-center gap-2'>
											<div className='text-sm font-bold text-foreground truncate'>{rel.target?.name}</div>
											{rel.is_hidden && <EyeOff size={14} className='text-gray-400' title='Hidden from players' />}
										</div>
										<div className='text-[10px] text-muted-foreground uppercase tracking-wider flex gap-1'>
											<span>{rel.relationship_type}</span>
											<span className='opacity-50'>•</span>
											<span>{rel.target?.type}</span>
										</div>
									</div>
								</div>
								{/* FIXED: Larger buttons */}
								<div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
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
				))}
			</div>
		</div>
	);
}
