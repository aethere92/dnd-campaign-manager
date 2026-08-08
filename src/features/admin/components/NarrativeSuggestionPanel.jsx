import { useState, useMemo, useCallback } from 'react';
import { Scan, Check, Loader2, CheckCheck, AlertCircle } from 'lucide-react';
import { useEntityIndex } from '@/features/smart-text/hooks/useEntityIndex';
import { scanSession } from '@/features/admin/utils/narrativeScanner';
import {
	fetchRelationships,
	addRelationship,
	fetchSessionEventsWithRelationships,
} from '@/features/admin/api/adminService';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { ADMIN_SECTION_CLASS, ADMIN_HEADER_CLASS } from './AdminFormStyles';
import Button from '@/shared/components/ui/Button';

function EntityBadge({ name, type }) {
	const config = getEntityConfig(type);
	const Icon = config.icon;
	return (
		<span className='inline-flex items-center gap-1.5 text-xs'>
			<Icon size={12} style={{ color: config.color }} />
			<span className='font-semibold text-foreground'>{name}</span>
			<span className='text-[9px] uppercase text-muted-foreground'>{type}</span>
		</span>
	);
}

function MentionRow({ mention, checked, onToggle, mentionKey }) {
	return (
		<label className='flex items-center gap-3 py-1.5 px-2 hover:bg-muted/30 rounded cursor-pointer transition-colors'>
			<input
				type='checkbox'
				checked={checked}
				onChange={() => onToggle(mentionKey)}
				className='w-3.5 h-3.5 rounded accent-amber-600'
			/>
			<EntityBadge name={mention.entityName} type={mention.entityType} />
			<span className='text-[10px] text-muted-foreground truncate ml-auto max-w-[40%] italic'>{mention.snippet}</span>
		</label>
	);
}

function SectionToggle({ label, icon: Icon, checkedCount, totalCount, onSelectAll, onDeselectAll }) {
	const allChecked = checkedCount === totalCount;
	const noneChecked = checkedCount === 0;
	return (
		<h3 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center justify-between'>
			<span className='flex items-center gap-1'>
				{Icon && <Icon size={11} />} {label}
			</span>
			<span className='flex items-center gap-1.5'>
				<button
					type='button'
					onClick={onSelectAll}
					disabled={allChecked}
					className='text-[9px] text-primary hover:underline disabled:opacity-30 disabled:no-underline'>
					all
				</button>
				<span className='text-[9px] text-muted-foreground/40'>|</span>
				<button
					type='button'
					onClick={onDeselectAll}
					disabled={noneChecked}
					className='text-[9px] text-primary hover:underline disabled:opacity-30 disabled:no-underline'>
					none
				</button>
				<span className='text-[9px] bg-muted/50 px-1.5 py-0.5 rounded-full ml-1'>
					{checkedCount}/{totalCount}
				</span>
			</span>
		</h3>
	);
}

export default function NarrativeSuggestionPanel({ sessionId, narrative }) {
	const { searchTokens, map: entityMap } = useEntityIndex();

	// Phase states
	const [scanning, setScanning] = useState(false);
	const [applying, setApplying] = useState(false);
	const [error, setError] = useState(null);

	// Results
	const [sessionMentions, setSessionMentions] = useState([]);
	const [eventMentions, setEventMentions] = useState([]);

	// Selection state
	const [checkedMentions, setCheckedMentions] = useState(new Set());

	// Applied tracking
	const [applied, setApplied] = useState(false);

	// --- Phase 1: Scan narrative for entity mentions ---
	const handleScan = useCallback(async () => {
		setScanning(true);
		setError(null);
		setApplied(false);
		try {
			const [existingRels, events] = await Promise.all([
				fetchRelationships(sessionId),
				fetchSessionEventsWithRelationships(sessionId),
			]);

			const { sessionMentions: sMentions, eventMentions: eMentions } = scanSession(
				narrative,
				events,
				searchTokens,
				entityMap,
				existingRels
			);

			setSessionMentions(sMentions);
			setEventMentions(eMentions);
			// Default: all mentions checked — use composite keys (source:entityId)
			const allKeys = new Set(sMentions.map((m) => `narrative:${m.entityId}`));
			eMentions.forEach((eg) => eg.mentions.forEach((m) => allKeys.add(`${eg.eventId}:${m.entityId}`)));
			setCheckedMentions(allKeys);
		} catch (e) {
			setError('Scan failed: ' + e.message);
		} finally {
			setScanning(false);
		}
	}, [sessionId, narrative, searchTokens, entityMap]);

	// --- Phase 3: Apply selected suggestions ---
	const handleApply = useCallback(async () => {
		setApplying(true);
		setError(null);
		try {
			const ops = [];

			// Session-level mention relationships
			sessionMentions
				.filter((m) => checkedMentions.has(`narrative:${m.entityId}`))
				.forEach((m) => {
					ops.push(
						addRelationship({
							from_entity_id: sessionId,
							to_entity_id: m.entityId,
							relationship_type: 'mention',
							is_bidirectional: false,
						})
					);
				});

			// Event-level mention tags
			eventMentions.forEach((eg) => {
				eg.mentions
					.filter((m) => checkedMentions.has(`${eg.eventId}:${m.entityId}`))
					.forEach((m) => {
						ops.push(
							addRelationship({
								from_entity_id: eg.eventId,
								to_entity_id: m.entityId,
								relationship_type: 'mention',
								is_bidirectional: false,
							})
						);
					});
			});

			await Promise.all(ops);
			setApplied(true);
		} catch (e) {
			setError('Apply failed: ' + e.message);
		} finally {
			setApplying(false);
		}
	}, [sessionId, sessionMentions, eventMentions, checkedMentions]);

	// --- Selection helpers (composite keys: "source:entityId") ---
	const toggleMention = (key) => {
		setCheckedMentions((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	};

	// --- Batch selection helpers ---
	const allMentionKeys = useMemo(() => {
		const keys = sessionMentions.map((m) => `narrative:${m.entityId}`);
		eventMentions.forEach((eg) => eg.mentions.forEach((m) => keys.push(`${eg.eventId}:${m.entityId}`)));
		return keys;
	}, [sessionMentions, eventMentions]);

	const selectAllMentions = () => setCheckedMentions(new Set(allMentionKeys));
	const deselectAllMentions = () => setCheckedMentions(new Set());

	const sessionMentionKeys = useMemo(() => sessionMentions.map((m) => `narrative:${m.entityId}`), [sessionMentions]);
	const selectSessionMentions = () => {
		setCheckedMentions((prev) => {
			const next = new Set(prev);
			sessionMentionKeys.forEach((k) => next.add(k));
			return next;
		});
	};
	const deselectSessionMentions = () => {
		setCheckedMentions((prev) => {
			const next = new Set(prev);
			sessionMentionKeys.forEach((k) => next.delete(k));
			return next;
		});
	};

	const selectEventMentions = (eventId) => {
		const eg = eventMentions.find((e) => e.eventId === eventId);
		if (!eg) return;
		setCheckedMentions((prev) => {
			const next = new Set(prev);
			eg.mentions.forEach((m) => next.add(`${eventId}:${m.entityId}`));
			return next;
		});
	};
	const deselectEventMentions = (eventId) => {
		const eg = eventMentions.find((e) => e.eventId === eventId);
		if (!eg) return;
		setCheckedMentions((prev) => {
			const next = new Set(prev);
			eg.mentions.forEach((m) => next.delete(`${eventId}:${m.entityId}`));
			return next;
		});
	};

	const totalMentions = sessionMentions.length + eventMentions.reduce((sum, eg) => sum + eg.mentions.length, 0);
	const selectedMentionCount = checkedMentions.size;
	const hasResults = totalMentions > 0;

	return (
		<div className={ADMIN_SECTION_CLASS}>
			<h2 className={ADMIN_HEADER_CLASS}>
				<span className='flex items-center gap-2'>
					<Scan size={18} className='text-amber-600' /> Narrative Scanner
				</span>
			</h2>

			{/* Action Buttons */}
			<div className='flex items-center gap-2 flex-wrap'>
				<Button
					onClick={handleScan}
					disabled={scanning || !narrative}
					variant='secondary'
					size='sm'
					icon={scanning ? Loader2 : Scan}>
					{scanning ? 'Scanning...' : 'Scan Narrative'}
				</Button>

				{hasResults && !applied && (
					<>
						<Button
							onClick={handleApply}
							disabled={applying || selectedMentionCount === 0}
							variant='primary'
							size='sm'
							icon={applying ? Loader2 : Check}>
							{applying ? 'Applying...' : `Apply (${selectedMentionCount} selected)`}
						</Button>
						<span className='text-[9px] text-muted-foreground flex items-center gap-1 ml-1'>
							<button type='button' onClick={selectAllMentions} className='text-primary hover:underline'>
								select all
							</button>
							<span className='text-muted-foreground/40'>|</span>
							<button type='button' onClick={deselectAllMentions} className='text-primary hover:underline'>
								deselect all
							</button>
						</span>
					</>
				)}

				{applied && (
					<span className='flex items-center gap-1 text-xs text-emerald-600 font-medium'>
						<CheckCheck size={14} /> Applied
					</span>
				)}
			</div>

			{error && (
				<div className='flex items-center gap-2 text-xs text-red-600 bg-red-500/10 px-3 py-2 rounded border border-red-200'>
					<AlertCircle size={14} /> {error}
				</div>
			)}

			{/* Section A: Session Mentions */}
			{sessionMentions.length > 0 && (
				<div>
					<SectionToggle
						label='Narrative Mentions'
						checkedCount={sessionMentions.filter((m) => checkedMentions.has(`narrative:${m.entityId}`)).length}
						totalCount={sessionMentions.length}
						onSelectAll={selectSessionMentions}
						onDeselectAll={deselectSessionMentions}
					/>
					<div className='divide-y divide-border/30'>
						{sessionMentions.map((m) => (
							<MentionRow
								key={`narrative:${m.entityId}`}
								mention={m}
								mentionKey={`narrative:${m.entityId}`}
								checked={checkedMentions.has(`narrative:${m.entityId}`)}
								onToggle={toggleMention}
							/>
						))}
					</div>
				</div>
			)}

			{/* Event-level mentions */}
			{eventMentions.length > 0 && (
				<div>
					<h3 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>Event Tags</h3>
					{eventMentions.map((eg) => {
						const egChecked = eg.mentions.filter((m) => checkedMentions.has(`${eg.eventId}:${m.entityId}`)).length;
						return (
							<div key={eg.eventId} className='mb-2'>
								<SectionToggle
									label={eg.eventTitle}
									checkedCount={egChecked}
									totalCount={eg.mentions.length}
									onSelectAll={() => selectEventMentions(eg.eventId)}
									onDeselectAll={() => deselectEventMentions(eg.eventId)}
								/>
								<div className='divide-y divide-border/30'>
									{eg.mentions.map((m) => (
										<MentionRow
											key={`${eg.eventId}:${m.entityId}`}
											mention={m}
											mentionKey={`${eg.eventId}:${m.entityId}`}
											checked={checkedMentions.has(`${eg.eventId}:${m.entityId}`)}
											onToggle={toggleMention}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Empty state */}
			{!scanning && totalMentions === 0 && (
				<p className='text-xs text-muted-foreground italic text-center py-4'>
					Click "Scan Narrative" to detect entity mentions.
				</p>
			)}
		</div>
	);
}
