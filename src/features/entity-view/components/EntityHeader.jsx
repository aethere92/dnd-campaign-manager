import { clsx } from 'clsx';

export const EntityHeader = ({ data }) => {
	const { title, typeLabel, imageUrl, avatarUrl, status, theme, extraTags } = data;
	const { Icon } = theme;

	return (
		<div className='h-40 md:h-48 relative group overflow-hidden header-bg-fallback'>
			{/* 1. BACKGROUND LAYER (Banner) */}
			{imageUrl && (
				<img src={imageUrl} alt={title} className='absolute inset-0 w-full h-full object-cover object-top opacity-60' />
			)}

			{/* Gradient Overlay - Adapts to theme */}
			<div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-10' />
			<div className='absolute inset-0 header-gradient translate-y-1' />

			{/* Content Layer */}
			<div className='absolute bottom-0 left-0 w-full p-4 md:p-6'>
				<div className='max-w-6xl mx-auto flex items-end gap-4'>
					{/* 2. AVATAR BOX (Icon vs SVG) */}
					<div
						className={clsx(
							'rounded-lg shadow-md border hidden md:flex items-center justify-center overflow-hidden',
							// If we have an image, we don't want padding or coloring, just the image
							avatarUrl ? 'w-16 h-16 bg-white border-white' : `p-2.5 ${theme.bg} ${theme.border} ${theme.text}`
						)}>
						{avatarUrl ? <img src={avatarUrl} alt='' className='w-full h-full object-cover' /> : <Icon size={18} />}
					</div>

					{/* Title & Status */}
					<div className='flex-1'>
						<div className='flex items-center flex-wrap gap-2 mb-1.5'>
							<span className='px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-sm'>
								{typeLabel}
							</span>

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
