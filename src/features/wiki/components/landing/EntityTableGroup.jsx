import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowRight, CornerDownRight } from 'lucide-react';
import { getStatusInfo } from '@/domain/entity/utils/statusUtils';
import EntityBadge from '@/domain/entity/components/EntityBadge';
import { parseAttributes } from '@/shared/utils/imageUtils';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';

export const EntityTableGroup = ({ title, parentTitle, link, items }) => {
	if (!items || items.length === 0) return null;

	return (
		<div className='mb-8 animate-in fade-in duration-500'>
			{/* Group Header */}
			<div className='flex items-center gap-2 border-b border-border/60 pb-2 mb-3'>
				{parentTitle && (
					// FIX: Increased opacity from /40 to /80 for visibility
					<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest'>
						{parentTitle}
						{/* FIX: Removed opacity-50 to make arrow visible */}
						<CornerDownRight size={10} className='translate-y-px text-muted-foreground' />
					</div>
				)}
				<h2 className='text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide'>
					{title}
					{link && (
						<Link
							to={link}
							className='text-muted-foreground/50 hover:text-primary transition-colors'
							title={`View ${title}`}>
							<ArrowRight size={12} />
						</Link>
					)}
				</h2>
				<span className='text-[9px] font-bold bg-muted px-1.5 py-px rounded text-muted-foreground/60 ml-auto'>
					{items.length}
				</span>
			</div>

			{/* Table Container */}
			<div className='bg-background border border-border rounded-lg overflow-hidden shadow-sm'>
				<table className='w-full text-left text-sm'>
					<thead className='bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border'>
						<tr>
							<th className='px-4 py-2 w-[40%]'>Name</th>
							<th className='px-4 py-2 w-[20%]'>Status</th>
							<th className='px-4 py-2 hidden md:table-cell'>Details</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-border/50'>
						{items.map((entity) => {
							const status = getStatusInfo(entity);
							const attributes = parseAttributes(entity.attributes);
							const role = getAttributeValue(attributes, ['role', 'occupation', 'class', 'type']) || entity.type;

							// Check if row needs highlighting
							const isSpecialStatus = status.isDead || status.isFailed || status.rank === 1 || status.rank === 3;

							return (
								<tr key={entity.id} className='group hover:bg-muted/30 transition-colors'>
									<td className='px-4 py-2.5'>
										<Link
											to={`/wiki/${entity.type}/${entity.id}`}
											className='flex items-center gap-3 font-serif font-bold text-foreground group-hover:text-primary transition-colors'>
											{/* Small colored indicator bar */}
											{isSpecialStatus && (
												<div
													className={clsx(
														'w-1 h-4 rounded-full shrink-0',
														status.isDead || status.isFailed
															? 'bg-red-500/100'
															: status.rank === 1
															? 'bg-emerald-500/100'
															: status.rank === 3
															? 'bg-red-600'
															: 'bg-gray-300'
													)}
												/>
											)}
											{entity.name}
										</Link>
									</td>
									<td className='px-4 py-2.5'>
										{status.display && (
											<span
												className={clsx(
													'inline-flex items-center text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border',
													status.isDead || status.isFailed
														? 'bg-red-500/10 text-red-700 border-red-100'
														: 'bg-muted text-muted-foreground border-border'
												)}>
												{status.display}
											</span>
										)}
									</td>
									<td className='px-4 py-2.5 hidden md:table-cell'>
										<div className='flex items-center gap-2'>
											<EntityBadge type={entity.type} size='sm' variant='subtle' />
											<span className='text-xs text-muted-foreground truncate max-w-[200px]'>
												{role !== entity.type ? role : ''}
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
