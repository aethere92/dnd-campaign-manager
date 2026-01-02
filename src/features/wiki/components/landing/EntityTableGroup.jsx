import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowRight, CornerDownRight, Activity } from 'lucide-react';
import { getStatusInfo } from '@/domain/entity/utils/statusUtils';
import EntityBadge from '@/domain/entity/components/EntityBadge';
import { parseAttributes } from '@/shared/utils/imageUtils';
import { getAttributeValue } from '@/domain/entity/utils/attributeParser';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

/**
 * CONFIGURATION: Table Definitions
 * Defines columns, widths, and RENDER logic in one place.
 */
const TABLE_DEFINITIONS = {
	session: [
		{
			header: 'Session Title',
			width: '45%',
			render: (e, attr) => (
				<Link
					to={`/wiki/session/${e.id}`}
					className='font-serif font-bold text-foreground hover:text-primary transition-colors text-sm'>
					{e.name}
				</Link>
			),
		},
		{
			header: 'Date',
			width: '20%',
			render: (e, attr) => <span className='text-xs text-muted-foreground'>{attr.session_date || '-'}</span>,
		},
	],
	quest: [
		{
			header: 'Quest',
			width: '40%',
			render: (e) => (
				<Link
					to={`/wiki/quest/${e.id}`}
					className='font-serif text-sm font-bold text-foreground hover:text-primary transition-colors'>
					{e.name}
				</Link>
			),
		},
		{
			header: 'Status',
			width: '20%',
			render: (e) => {
				const s = getStatusInfo(e);
				if (!s.display) return <span className='text-muted-foreground'>-</span>;
				return (
					<span
						className={clsx(
							'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
							s.isCompleted
								? 'bg-emerald-500/10 text-emerald-600'
								: s.isFailed
								? 'bg-red-500/10 text-red-600'
								: 'bg-amber-500/10 text-amber-600'
						)}>
						{s.display}
					</span>
				);
			},
		},
		{
			header: 'Priority',
			width: '20%',
			render: (e) => <span className='text-xs font-semibold text-muted-foreground'>{e.meta.priority || '-'}</span>,
		},
	],
	location: [
		{
			header: 'Location',
			width: '40%',
			render: (e) => (
				<Link
					to={`/wiki/location/${e.id}`}
					className='font-serif font-bold text-sm text-foreground hover:text-primary transition-colors'>
					{e.name}
				</Link>
			),
		},
		{
			header: 'Type',
			width: '30%',
			hiddenOnMobile: true,
			render: (e, attr) => <EntityBadge type='location' label={attr.type} variant='subtle' />,
		},
	],
	npc: [
		{
			header: 'Name',
			width: '40%',
			render: (e) => (
				<Link
					to={`/wiki/npc/${e.id}`}
					className='font-serif text-sm font-bold text-foreground hover:text-primary transition-colors'>
					{e.name}
				</Link>
			),
		},
		{
			header: 'Affinity',
			width: '20%',
			render: (e) => {
				const s = getStatusInfo(e);
				if (!s.display) return <span className='text-muted-foreground'>-</span>;
				return (
					<span
						className={clsx(
							'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
							s.rank === 1
								? 'bg-emerald-500/10 text-emerald-600'
								: s.rank === 3
								? 'bg-red-500/10 text-red-600'
								: 'bg-muted text-muted-foreground'
						)}>
						{s.display}
					</span>
				);
			},
		},
		{
			header: 'Role',
			width: '40%',
			hiddenOnMobile: true,
			render: (e, attr) => (
				<span className='text-sm text-muted-foreground'>
					{getAttributeValue(attr, ['role', 'class', 'occupation']) || '-'}
				</span>
			),
		},
	],
	// Fallback for others
	default: [
		{
			header: 'Name',
			width: '60%',
			render: (e) => (
				<Link to={`/wiki/${e.type}/${e.id}`} className='font-serif font-bold text-sm text-foreground'>
					{e.name}
				</Link>
			),
		},
		{
			header: 'Type',
			width: '40%',
			render: (e) => <EntityBadge type={e.type} variant='outline' size='sm' />,
		},
	],
};

const getColumns = (type) => TABLE_DEFINITIONS[type] || TABLE_DEFINITIONS[type === 'faction' ? 'npc' : 'default'];

export const EntityTableGroup = ({ title, description, parentTitle, link, items }) => {
	if (!items || items.length === 0) return null;

	const type = items[0].type;
	const columns = getColumns(type);

	return (
		<div className='mb-10 animate-in fade-in duration-500'>
			{/* Header */}
			<div className='mb-3'>
				<div className='flex items-center gap-2 border-b border-border/60 pb-2'>
					{parentTitle && (
						<div className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest'>
							{parentTitle}
							<CornerDownRight size={10} className='translate-y-px text-muted-foreground' />
						</div>
					)}
					<h2 className='text-lg font-bold font-serif text-foreground flex items-center gap-2'>
						{title}
						{link && (
							<Link to={link} className='text-muted-foreground/50 hover:text-primary transition-colors'>
								<ArrowRight size={14} />
							</Link>
						)}
					</h2>
					<span className='text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto'>
						{items.length}
					</span>
				</div>
				{description && (
					<div className='mt-2 text-sm text-muted-foreground/80 leading-relaxed pl-2 border-l-2 border-primary/20'>
						<SmartMarkdown>{description.substring(0, 300) + '...'}</SmartMarkdown>
					</div>
				)}
			</div>

			{/* The Table */}
			<div className='border border-border rounded-lg overflow-hidden shadow-sm'>
				<table className='w-full text-left border-collapse'>
					<thead className='bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground tracking-wider'>
						<tr>
							{columns.map((col, i) => (
								<th
									key={i}
									className={clsx(
										'px-4 py-2.5 font-semibold',
										col.hiddenOnMobile && 'hidden md:table-cell',
										col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
									)}
									style={{ width: col.width }}>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className='divide-y divide-border/40'>
						{items.map((entity) => {
							const attributes = parseAttributes(entity.attributes);
							return (
								<tr key={entity.id} className='group hover:bg-muted/30 transition-colors'>
									{columns.map((col, i) => (
										<td
											key={i}
											className={clsx(
												'px-4 py-2.5',
												col.hiddenOnMobile && 'hidden md:table-cell',
												col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
											)}>
											{col.render(entity, attributes)}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};
