import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { Edit3, X, Maximize2 } from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import EntityBadge from '@/domain/entity/components/EntityBadge';
import { getPriorityStyles } from '@/domain/entity/config/entityStyles';

const ImageLightbox = ({ src, alt, onClose }) => {
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		const handleEsc = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handleEsc);
		return () => {
			document.body.style.overflow = 'unset';
			window.removeEventListener('keydown', handleEsc);
		};
	}, [onClose]);

	return createPortal(
		<div
			className='fixed inset-0 z-[9999] flex items-center justify-center p-8 bg-background/30 backdrop-blur-md animate-in fade-in duration-200'
			onClick={onClose}>
			<div
				className='relative inline-block shadow-2xl rounded-lg overflow-hidden bg-black/5 ring-1 ring-black/10'
				onClick={(e) => e.stopPropagation()}>
				<img src={src} alt={alt} className='max-w-[85vw] max-h-[85vh] object-contain block select-none' />
				<button
					onClick={onClose}
					className='absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white/90 hover:text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-sm'>
					<X size={18} strokeWidth={2.5} />
				</button>
			</div>
		</div>,
		document.body
	);
};

export const EntityHeader = ({ data }) => {
	const { title, subtitle, typeLabel, imageUrl, avatarUrl, status, priority, extraTags, type } = data;
	const { entityId } = useParams();
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const isDev = import.meta.env.DEV;

	const noImageStyle = !imageUrl
		? {
				background: `radial-gradient(80% 100% at 50% -20%, var(--muted) 0%, var(--background) 100%)`,
		  }
		: {};

	return (
		<>
			<div
				className={clsx(
					'h-48 md:h-64 relative group overflow-hidden select-none',
					imageUrl ? 'cursor-pointer' : 'border-b border-border/40'
				)}
				style={noImageStyle}
				onClick={() => imageUrl && setIsLightboxOpen(true)}>
				{imageUrl && (
					<>
						<img
							src={imageUrl}
							alt={title}
							className={clsx(
								'absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out',
								'object-[center_30%] group-hover:object-[center_50%] group-hover:scale-105'
							)}
						/>
						<div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'>
							<div className='bg-black/30 backdrop-blur-md p-2 rounded-full text-white/80 border border-white/10 shadow-lg'>
								<Maximize2 size={16} />
							</div>
						</div>
						<div className='absolute inset-0 bg-gradient-to-t from-[var(--background)] from-0% via-[var(--background)]/80 via-10% via-[var(--background)]/20 via-20% to-transparent pointer-events-none' />
					</>
				)}

				{isDev && entityId && (
					<div
						className='absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-2 duration-500'
						onClick={(e) => e.stopPropagation()}>
						<Link
							to={`/dm/manage/${typeLabel.toLowerCase()}/${entityId}`}
							className='flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg text-muted-foreground hover:text-primary hover:border-primary transition-all group/edit'>
							<Edit3 size={14} className='group-hover/edit:scale-110 transition-transform' />
							<span className='text-[10px] font-bold uppercase tracking-tight'>Quick Edit</span>
						</Link>
					</div>
				)}

				<div
					className={clsx(
						'absolute bottom-0 left-0 w-full pointer-events-none',
						type === 'character' ? 'p-4 md:p-6 md:pb-0!' : 'p-4 md:p-6 '
					)}>
					<div className='max-w-6xl mx-auto flex items-end gap-5'>
						<div className='hidden md:flex md:items-end pointer-events-auto mb-1'>
							<EntityIcon
								type={typeLabel.toLowerCase()}
								customIconUrl={avatarUrl}
								size={64}
								showBackground
								className='w-[84px] h-[84px] shadow-xl border-2 border-background/50 object-cover bg-background'
							/>
						</div>

						<div className='flex-1 pb-1 min-w-0'>
							<div className='flex items-center flex-wrap gap-2 mb-2'>
								<EntityBadge
									type={typeLabel.toLowerCase()}
									size='sm'
									variant='solid'
									className='bg-background/80 backdrop-blur-sm border-border/50 text-foreground shadow-sm'
								/>
								{status.hasStatus && (
									<span
										className={clsx(
											'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm',
											status.isDead ? 'badge-dead' : 'badge-alive'
										)}>
										{status.label}
									</span>
								)}
								{priority && (
									<span
										className={clsx(
											'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm',
											getPriorityStyles(priority)
										)}>
										{priority} Priority
									</span>
								)}
								{extraTags &&
									extraTags.map((tag, i) => (
										<span
											key={i}
											className='px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm bg-card/80 backdrop-blur-sm border-slate-300 text-slate-700 dark:text-slate-300 dark:border-slate-700'>
											{tag}
										</span>
									))}
							</div>

							<h1 className='text-3xl md:text-5xl font-serif font-bold text-foreground leading-none drop-shadow-sm tracking-tight break-words'>
								{title}
							</h1>

							{/* --- NEW: Subtitle (Race/Class/Level) --- */}
							{subtitle && (
								<div className='text-sm font-semibold text-muted-foreground opacity-90 drop-shadow-md'>{subtitle}</div>
							)}
						</div>
					</div>
				</div>
			</div>
			{isLightboxOpen && imageUrl && (
				<ImageLightbox src={imageUrl} alt={title} onClose={() => setIsLightboxOpen(false)} />
			)}
		</>
	);
};
