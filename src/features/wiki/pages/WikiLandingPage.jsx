import { useParams } from 'react-router-dom';
import { Search, Folder, LayoutGrid, List } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useEntityFetching } from '@/features/wiki/hooks/useEntityFetching';
import { useEntityGrouping } from '@/features/wiki/hooks/useEntityGrouping';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
import { getSwimlanes, getStrategyMode } from '@/features/wiki/config/viewStrategies';
import { Swimlane } from '../components/landing/Swimlane';
import { EntityTableGroup } from '../components/landing/EntityTableGroup';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { clsx } from 'clsx';

export default function WikiLandingPage() {
	const { type } = useParams();
	const normalizedType = type === 'sessions' ? 'session' : type;

	const { entities, isLoading } = useEntityFetching(normalizedType);
	const [viewMode, setViewMode] = useState('grid');
	const [search, setSearch] = useState('');

	const config = getEntityConfig(normalizedType);
	const mode = getStrategyMode(normalizedType);
	const groups = useEntityGrouping(entities, normalizedType, search);
	const swimlanes = useMemo(() => getSwimlanes(groups, normalizedType), [groups, normalizedType]);

	if (isLoading) return <LoadingSpinner text={`Loading ${config.labelPlural}...`} />;

	const totalCount = swimlanes.reduce((acc, lane) => acc + lane.items.length, 0);

	return (
		// OPTIMIZATION: Removed fixed p-12, used responsive padding
		<div className='p-4 md:p-8 lg:p-12 max-w-[1920px] mx-auto min-h-full pb-safe'>
			{/* Header */}
			<div className='flex flex-col gap-6 mb-6 border-b border-border pb-6'>
				{/* Top Row: Title */}
				<div className='flex items-center gap-4'>
					<div
						className={clsx(
							'p-3 rounded-xl border shadow-sm bg-background hidden md:block',
							config.tailwind.border,
							config.tailwind.text
						)}>
						<config.icon size={32} strokeWidth={1.5} />
					</div>
					<div>
						<h1 className='text-2xl md:text-3xl font-serif font-bold text-foreground capitalize leading-none mb-1'>
							{config.labelPlural}
						</h1>
						<p className='text-xs md:text-sm text-muted-foreground font-medium'>{totalCount} entries found</p>
					</div>
				</div>

				{/* Controls Area - Stacks on mobile, Row on desktop */}
				<div className='flex flex-col sm:flex-row gap-3 w-full'>
					{/* Search Bar - Full width on mobile */}
					<div className='relative flex-1 order-2 sm:order-1'>
						<Search size={16} className='absolute left-3 top-3 text-muted-foreground' />
						<input
							type='text'
							placeholder={`Search ${config.labelPlural}...`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							// text-base on mobile prevents zoom
							className='w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none shadow-sm transition-all'
						/>
					</div>

					{/* View Toggle - Beside search on desktop, Top on mobile */}
					<div className='flex bg-muted p-1 rounded-lg border border-border/50 shrink-0 self-start order-1 sm:order-2'>
						<button
							onClick={() => setViewMode('grid')}
							className={clsx(
								'p-2 sm:p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center',
								viewMode === 'grid'
									? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
									: 'text-muted-foreground hover:text-foreground'
							)}
							title='Grid View'>
							<LayoutGrid size={18} />
						</button>
						<button
							onClick={() => setViewMode('table')}
							className={clsx(
								'p-2 sm:p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center',
								viewMode === 'table'
									? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
									: 'text-muted-foreground hover:text-foreground'
							)}
							title='Table View'>
							<List size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* CONTENT */}
			<div className='pb-20'>
				{viewMode === 'grid' ? (
					swimlanes.map((lane) => (
						<Swimlane
							key={lane.id}
							title={lane.title}
							parentTitle={lane.parentTitle}
							link={lane.link}
							items={lane.items}
							config={config}
							context={mode}
						/>
					))
				) : (
					<div className='max-w-5xl mx-auto'>
						{swimlanes.map((lane) => (
							<EntityTableGroup
								key={lane.id}
								title={lane.title}
								parentTitle={lane.parentTitle}
								link={lane.link}
								items={lane.items}
							/>
						))}
					</div>
				)}

				{totalCount === 0 && (
					<div className='text-center py-20 opacity-40 flex flex-col items-center gap-4 border-2 border-dashed border-border rounded-xl mt-4'>
						<Folder size={48} strokeWidth={1} />
						<p className='text-lg font-serif text-muted-foreground'>No entries found.</p>
					</div>
				)}
			</div>
		</div>
	);
}
