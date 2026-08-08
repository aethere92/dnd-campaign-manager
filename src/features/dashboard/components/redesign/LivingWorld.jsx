import { useNavigate } from 'react-router-dom';
import { ScrollText, Sparkles, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useCampaignRoutes } from '@/app/hooks/useCampaignRoutes';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { getPriorityStyles } from '@/domain/entity/config/entityStyles';
import { formatDate } from '@/shared/utils/textUtils';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { SectionHeading } from './SectionHeading';

const PRIORITY_DOT = {
	critical: 'var(--entity-character, #ef4444)',
	high: 'var(--entity-encounter, #f97316)',
	medium: 'var(--entity-quest, #3b82f6)',
};

/**
 * "The Living World" — two columns: unresolved quest threads (with priority)
 * and a ledger of recently added lore entities. Both link into the wiki.
 */
export function LivingWorld({ threads = [], recentEntities = [] }) {
	if (!threads.length && !recentEntities.length) return null;

	return (
		<>
			<SectionHeading icon={ScrollText} eyebrow='The Living World' title='Threads pull, lore accrues' />

			<div className='mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 max-w-5xl mx-auto'>
				{threads.length > 0 && <ThreadsColumn threads={threads} />}
				{recentEntities.length > 0 && <LedgerColumn entities={recentEntities} />}
			</div>
		</>
	);
}

function ThreadsColumn({ threads }) {
	const navigate = useNavigate();
	const routes = useCampaignRoutes();

	return (
		<div>
			<h3 className='flex items-center gap-2.5 font-display font-bold text-xl mb-5'>
				<ScrollText size={18} className='text-primary' />
				Loose Threads
			</h3>

			<div>
				{threads.slice(0, 5).map((thread) => {
					const priority = (thread.attributes?.priority || 'normal').toLowerCase();
					const dot = PRIORITY_DOT[priority] || 'var(--muted-foreground)';
					const showPriority = priority !== 'normal' && priority !== 'low';

					const activeObj = thread.objectives?.find((o) => o.status === 'active');
					const narrative = activeObj?.objective_update || activeObj?.description || thread.description;

					return (
						<div
							key={thread.id}
							onClick={(e) => {
								if (e.target.closest('a')) return;
								navigate(routes.wikiEntity('quest', thread.id));
							}}
							className='group relative pl-6 py-4 border-b border-border cursor-pointer transition-[padding] hover:pl-8'>
							<span
								className='absolute left-0 top-[22px] w-2 h-2 rounded-full'
								style={{ background: dot, boxShadow: `0 0 12px ${dot}` }}
							/>
							<div className='flex items-center gap-2.5'>
								<h4 className='font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors'>
									<SmartMarkdown inline disableTooltips>
										{thread.title || thread.name}
									</SmartMarkdown>
								</h4>
								{showPriority && (
									<span
										className={clsx(
											'inline-flex items-center gap-1 shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border',
											getPriorityStyles(priority)
										)}>
										<AlertCircle size={9} />
										{priority}
									</span>
								)}
							</div>
							{narrative && (
								<div className='text-[13.5px] text-muted-foreground font-serif mt-1.5 line-clamp-2'>
									<SmartMarkdown components={{ p: 'span' }} disableTooltips>
										{narrative}
									</SmartMarkdown>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function LedgerColumn({ entities }) {
	const navigate = useNavigate();
	const routes = useCampaignRoutes();

	return (
		<div>
			<h3 className='flex items-center gap-2.5 font-display font-bold text-xl mb-5'>
				<Sparkles size={18} className='text-primary' />
				Recently Unearthed
			</h3>

			<div>
				{entities.slice(0, 6).map((entity) => {
					const config = getEntityConfig(entity.type);
					const Icon = config.icon;

					return (
						<div
							key={entity.id}
							onClick={(e) => {
								if (e.target.closest('a')) return;
								navigate(routes.wikiEntity(entity.type, entity.id));
							}}
							className='group flex items-start gap-3.5 py-3.5 border-b border-border cursor-pointer transition-transform hover:translate-x-1.5'>
							<div
								className='shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border'
								style={{
									color: config.color,
									background: `color-mix(in srgb, ${config.color} 12%, transparent)`,
									borderColor: `color-mix(in srgb, ${config.color} 24%, transparent)`,
								}}>
								<Icon size={17} />
							</div>
							<div className='flex-1 min-w-0'>
								<div className='flex items-baseline justify-between gap-3'>
									<h4 className='font-display font-bold text-[16px] truncate group-hover:text-primary transition-colors'>
										<SmartMarkdown inline disableTooltips>
											{entity.name}
										</SmartMarkdown>
									</h4>
									<span className='shrink-0 text-[11px] text-muted-foreground whitespace-nowrap'>
										{formatDate(entity.created_at)}
									</span>
								</div>
								<div className='flex items-center gap-2 mt-0.5'>
									<span
										className='text-[9px] font-bold uppercase tracking-[0.12em]'
										style={{ color: config.color }}>
										{config.label}
									</span>
									{entity.description && (
										<>
											<span className='text-muted-foreground/40'>·</span>
											<span className='text-[13px] text-muted-foreground truncate min-w-0'>
												<SmartMarkdown inline disableTooltips>
													{entity.description}
												</SmartMarkdown>
											</span>
										</>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
