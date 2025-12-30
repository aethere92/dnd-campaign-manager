import { Link } from 'react-router-dom';
import { ArrowRight, CornerDownRight } from 'lucide-react';
import { EntityGridCard } from './EntityGridCard';

export const Swimlane = ({ title, parentTitle, link, items, config, context }) => {
	if (!items || items.length === 0) return null;

	return (
		<div className='mb-8 last:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500'>
			{/* Header: Compact Visual Hierarchy */}
			<div className='flex items-center gap-2 border-b border-border/60 pb-1.5 mb-3 group/header'>
				{parentTitle && (
					<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest'>
						{parentTitle}
						<CornerDownRight size={10} className='translate-y-px opacity-50' />
					</div>
				)}

				<h2 className='text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide'>
					{title}
					{link && (
						<Link
							to={link}
							className='text-muted-foreground/20 hover:text-accent transition-colors'
							title={`View ${title}`}>
							<ArrowRight size={12} />
						</Link>
					)}
				</h2>

				<span className='text-[9px] font-bold bg-muted px-1.5 py-px rounded text-muted-foreground/60 ml-auto'>
					{items.length}
				</span>
			</div>

			{/* Grid - Reverted to Standard Responsive Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3'>
				{items.map((entity) => (
					<EntityGridCard key={entity.id} entity={entity} config={config} context={context} />
				))}
			</div>
		</div>
	);
};
