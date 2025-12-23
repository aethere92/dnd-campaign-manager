import { clsx } from 'clsx';
import EntityIcon from '../../../components/entity/EntityIcon';
import EntityBadge from '../../../components/entity/EntityBadge';
import { getPriorityStyles } from '../../../config/entity/styles'; // Import

export const EntityHeader = ({ data }) => {
	const { title, typeLabel, imageUrl, avatarUrl, status, priority, theme, extraTags } = data;

	return (
		<div className='h-40 md:h-48 relative group overflow-hidden header-bg-fallback'>
			{/* 1. BACKGROUND LAYER (Banner) */}
			{imageUrl && (
				<img src={imageUrl} alt={title} className='absolute inset-0 w-full h-full object-cover object-top opacity-60' />
			)}

			{/* Gradient Overlay */}
			<div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-10' />
			<div className='absolute inset-0 header-gradient translate-y-1' />

			{/* Content Layer */}
			<div className='absolute bottom-0 left-0 w-full p-4 md:p-6'>
				<div className='max-w-6xl mx-auto flex items-end gap-4'>
					{/* 2. AVATAR - Using EntityIcon component */}
					<div className='hidden md:flex md:items-end'>
						<EntityIcon
							type={typeLabel.toLowerCase()}
							customIconUrl={avatarUrl}
							size={32}
							showBackground
							className='w-16 h-16 shadow-md'
						/>
					</div>

					{/* Title & Status */}
					<div className='flex-1'>
						<div className='flex items-center flex-wrap gap-2 mb-1.5'>
							{/* Type Badge */}
							<EntityBadge type={typeLabel.toLowerCase()} size='sm' variant='solid' />

							{/* Status Badge */}
							{status.hasStatus && (
								<span
									className={clsx(
										'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm',
										status.isDead
											? 'border-red-600 text-red-700 bg-red-50'
											: 'border-emerald-600 text-emerald-700 bg-emerald-50'
									)}>
									{status.label}
								</span>
							)}

							{/* Priority Badge (For Quests) */}
							{priority && (
								<span
									className={clsx(
										'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm',
										getPriorityStyles(priority) // Use centralized logic
									)}>
									{priority} Priority
								</span>
							)}

							{/* Extra Tags */}
							{extraTags &&
								extraTags.map((tag, i) => (
									<span
										key={i}
										className='px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm bg-white/80 border-slate-300 text-slate-700'>
										{tag}
									</span>
								))}
						</div>
						<h1 className='text-3xl md:text-4xl font-serif font-bold text-foreground leading-none drop-shadow-sm'>
							{title}
						</h1>
					</div>
				</div>
			</div>
		</div>
	);
};
