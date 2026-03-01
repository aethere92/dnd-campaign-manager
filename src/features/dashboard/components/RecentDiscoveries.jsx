import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { formatDate } from '@/shared/utils/textUtils';

export const RecentDiscoveries = ({ entities }) => {
	const navigate = useNavigate();

	if (!entities || entities.length === 0) return null;

	return (
		<div className='flex flex-col h-full'>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2'>
				<Sparkles size={12} /> Lore Ledger
			</h4>

			<div className='grid grid-cols-1 gap-3'>
				{entities.map((entity) => {
					const config = getEntityConfig(entity.type);
					const Icon = config?.icon || Compass;

					return (
						<div
							key={entity.id}
							onClick={(e) => {
								if (e.target.closest('a')) return;
								navigate(`/wiki/${entity.type}/${entity.id}`);
							}}
							className='group flex items-start gap-3 p-3 bg-muted/20 hover:bg-card border border-transparent hover:border-border rounded-lg transition-all cursor-pointer'>
							
							{/* Icon Badge */}
							<div className='shrink-0 p-2 rounded-md bg-background border border-border group-hover:border-primary/30 transition-colors' style={{ color: config?.color }}>
								<Icon size={16} />
							</div>

							{/* Content */}
							<div className='flex-1 min-w-0'>
								<div className='flex items-center justify-between gap-2 mb-0.5'>
									<h4 className='text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors'>
										<SmartMarkdown inline>{entity.name}</SmartMarkdown>
									</h4>
									<span className='text-[9px] text-muted-foreground/60 whitespace-nowrap hidden sm:block'>
										{formatDate(entity.created_at)}
									</span>
								</div>
								
								<div className='flex items-center gap-2'>
									<span className='text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80'>
										{config?.label || entity.type}
									</span>
									{entity.description && (
										<>
											<span className='text-muted-foreground/30'>•</span>
											<span className='text-xs text-muted-foreground truncate flex-1'>
												<SmartMarkdown inline disableTooltips>{entity.description}</SmartMarkdown>
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
};