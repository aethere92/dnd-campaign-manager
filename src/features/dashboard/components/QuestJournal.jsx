import { useNavigate } from 'react-router-dom';
import { Scroll, ChevronRight, Circle, CheckCircle2, Clock, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

const TYPE_STYLES = {
	'main quest': { color: 'text-amber-500', accent: 'border-l-amber-500/60' },
	'personal quest': { color: 'text-blue-400', accent: 'border-l-blue-400/60' },
	'side quest': { color: 'text-muted-foreground/60', accent: 'border-l-border' },
};

const PRIORITY_COLORS = {
	critical: 'text-red-500',
	high: 'text-orange-500',
};

const OBJECTIVE_STATUS_ICON = {
	completed: CheckCircle2,
	active: Clock,
	pending: Circle,
};

export const QuestJournal = ({ quests }) => {
	if (!quests || quests.length === 0) {
		return (
			<div className='flex items-center justify-center text-muted-foreground py-8'>
				<Scroll size={24} className='mr-2 opacity-20' />
				<p className='text-sm italic'>No active threads recorded.</p>
			</div>
		);
	}

	return (
		<div>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2'>
				<Scroll size={12} /> Quest Journal
			</h4>

			<div className='columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3'>
				{quests.map((quest) => (
					<QuestCard key={quest.id} quest={quest} />
				))}
			</div>
		</div>
	);
};


const QuestCard = ({ quest }) => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);

	const rawType = (quest.attributes?.['quest type'] || quest.attributes?.type || 'side quest').toLowerCase();
	const typeStyle = TYPE_STYLES[rawType] || TYPE_STYLES['side quest'];
	const typeLabel = rawType.replace(' quest', '');

	const priority = (quest.attributes?.priority || '').toLowerCase();
	const prioColor = PRIORITY_COLORS[priority];

	const objectives = quest.objectives || [];
	const completedCount = objectives.filter((o) => o.status === 'completed').length;
	const totalCount = objectives.length;
	const hasObjectives = totalCount > 0;
	const progressPct = hasObjectives ? Math.round((completedCount / totalCount) * 100) : 0;

	const latestUpdate = objectives.find((o) => o.status === 'active' && o.objective_update);

	const handleNavigate = (e) => {
		if (e.target.closest('a') || e.target.closest('button')) return;
		navigate(`/wiki/quest/${quest.id}`);
	};

	const handleToggle = (e) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded);
	};

	return (
		<div
			onClick={handleNavigate}
			className={clsx(
				'break-inside-avoid bg-card border border-border rounded-lg overflow-hidden',
				'border-l-2 cursor-pointer group',
				'hover:shadow-sm hover:border-primary/30 transition-all duration-200',
				typeStyle.accent
			)}>
			{/* Header */}
			<div className='flex items-start gap-2 px-3 py-2'>
				{hasObjectives && (
					<button
						onClick={handleToggle}
						className='mt-0.5 p-0.5 rounded hover:bg-muted/50 transition-colors shrink-0'
						aria-label={isExpanded ? 'Collapse objectives' : 'Expand objectives'}>
						<ChevronRight
							size={12}
							className={clsx(
								'text-muted-foreground transition-transform duration-200',
								isExpanded && 'rotate-90'
							)}
						/>
					</button>
				)}

				<div className='flex-1 min-w-0'>
					{/* Title + badges */}
					<div className='flex items-center gap-1.5 flex-wrap'>
						<span className='text-[13px] font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight'>
							<SmartMarkdown>{quest.title || quest.name}</SmartMarkdown>
						</span>
						{prioColor && (
							<span className={clsx('text-[8px] uppercase font-bold tracking-wider shrink-0', prioColor)}>
								{priority}
							</span>
						)}
					</div>

					{/* Type tag + progress inline */}
					<div className='flex items-center gap-2 mt-1'>
						<span className={clsx('text-[9px] uppercase font-bold tracking-wider', typeStyle.color)}>
							{typeLabel}
						</span>
						{hasObjectives && (
							<>
								<div className='flex-1 h-[3px] bg-muted rounded-full overflow-hidden max-w-[120px]'>
									<div
										className='h-full bg-primary/50 rounded-full transition-all duration-500'
										style={{ width: `${progressPct}%` }}
									/>
								</div>
								<span className='text-[9px] font-bold text-muted-foreground/50 tabular-nums'>
									{completedCount}/{totalCount}
								</span>
							</>
						)}
					</div>

					{/* Subtitle: latest update or description */}
					{(latestUpdate || quest.description) && (
						<div className='text-[11px] text-muted-foreground line-clamp-1 leading-snug mt-1'>
							<SmartMarkdown components={{ p: 'span' }}>
								{latestUpdate?.objective_update || quest.description}
							</SmartMarkdown>
						</div>
					)}
				</div>
			</div>

			{/* Expanded objectives */}
			{isExpanded && hasObjectives && (
				<div className='border-t border-border/50 bg-muted/20 px-3 py-1.5 space-y-0.5'>
					{objectives.map((obj) => {
						const StatusIcon = OBJECTIVE_STATUS_ICON[obj.status] || Circle;
						const isCompleted = obj.status === 'completed';
						const isActive = obj.status === 'active';

						return (
							<div key={obj.id} className='flex items-start gap-1.5 py-0.5'>
								<StatusIcon
									size={10}
									className={clsx(
										'mt-[3px] shrink-0',
										isCompleted && 'text-emerald-500',
										isActive && 'text-primary',
										!isCompleted && !isActive && 'text-muted-foreground/40'
									)}
								/>
								<span
									className={clsx(
										'text-[11px] leading-snug',
										isCompleted && 'text-muted-foreground/50 line-through',
										isActive && 'text-foreground',
										!isCompleted && !isActive && 'text-muted-foreground/60'
									)}>
									{obj.objective_name || obj.description}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};