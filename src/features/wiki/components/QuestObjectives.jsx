import { useState } from 'react';
import {
	CheckCircle2,
	Circle,
	XCircle,
	Target,
	Calendar,
	ChevronDown,
	ChevronRight,
	CornerDownRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import EntityLink from '@/domain/entity/components/EntityLink';

const QuestObjectiveItem = ({ obj }) => {
	const [isOpen, setIsOpen] = useState(false);

	const isCompleted = obj.status === 'completed';
	const isFailed = obj.status === 'failed';

	const hasUpdate = !!obj.objective_update;
	const hasSession = isCompleted && obj.completed_session_number;
	const hasContent = hasUpdate || (hasSession && obj.completed_session_title);

	const toggle = () => hasContent && setIsOpen(!isOpen);

	return (
		<div
			className={clsx(
				'transition-colors border-b border-border/40 last:border-0',
				isCompleted ? 'bg-emerald-500/10/10' : isFailed ? 'bg-red-500/10/10' : 'hover:bg-muted/30'
			)}>
			{/* --- MAIN ROW --- */}
			<div
				className={clsx(
					'flex items-start gap-3 px-3 py-2 cursor-pointer group',
					hasContent ? 'hover:bg-black/5' : 'cursor-default'
				)}
				onClick={toggle}>
				{/* Status Icon */}
				<div className='mt-1.5 shrink-0'>
					{isCompleted ? (
						<CheckCircle2 size={16} className='text-emerald-600' />
					) : isFailed ? (
						<XCircle size={16} className='text-red-500' />
					) : (
						<Circle size={16} className='text-muted-foreground/40' strokeWidth={2} />
					)}
				</div>

				{/* Text Content */}
				<div className='flex-1 min-w-0 pt-0.5'>
					<div className='flex items-center justify-between gap-2 mb-0.5'>
						{obj.objective_name && (
							<div className='text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide'>
								{obj.objective_name}
							</div>
						)}

						{/* Session Indicator Badge (Inline) */}
						{hasSession && (
							<div
								className='flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/60'
								title={`Completed in Session ${obj.completed_session_number - 1}`}>
								<Calendar size={10} />
								<span className='hidden sm:inline'>Session</span> {obj.completed_session_number - 1}
							</div>
						)}
					</div>

					<div
						className={clsx(
							'text-[13px] leading-snug font-medium transition-colors',
							isCompleted ? 'text-muted-foreground' : isFailed ? 'text-red-800/80' : 'text-foreground'
						)}>
						<SmartMarkdown components={{ p: 'span' }}>{obj.description}</SmartMarkdown>
					</div>
				</div>

				{/* Toggle Chevron */}
				{hasContent && (
					<button
						className={clsx(
							'shrink-0 text-muted-foreground/70 group-hover:text-foreground transition-colors mt-0.5',
							isOpen && 'text-foreground'
						)}>
						{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
					</button>
				)}
			</div>

			{/* --- DROPDOWN CONTENT --- */}
			{isOpen && hasContent && (
				<div className='pl-9 pr-3 pb-2 -mt-1 animate-in slide-in-from-top-1 fade-in duration-200'>
					<div className='flex flex-col gap-1.5'>
						{/* Update Text */}
						{hasUpdate && (
							<div className='flex gap-2 items-start'>
								<CornerDownRight size={12} className='shrink-0 mt-1 text-primary opacity-60' />
								<span className='text-xs text-muted-foreground italic leading-relaxed'>
									<SmartMarkdown>{obj.objective_update}</SmartMarkdown>
								</span>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export const QuestObjectives = ({ objectives }) => {
	if (!objectives || objectives.length === 0) return null;

	return (
		<div className='mb-8 not-prose border border-border rounded-lg overflow-hidden bg-muted/30/20'>
			<div className='px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2'>
				<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 m-0'>
					<Target size={12} className='text-primary' /> Quest Objectives
				</h3>
				<span className='ml-auto text-[9px] font-bold bg-muted/80 px-1.5 py-0.5 rounded text-muted-foreground'>
					{objectives.filter((o) => o.status === 'completed').length} / {objectives.length}
				</span>
			</div>

			<div className='bg-background'>
				{objectives.map((obj, idx) => (
					<QuestObjectiveItem key={obj.id || idx} obj={obj} />
				))}
			</div>
		</div>
	);
};
