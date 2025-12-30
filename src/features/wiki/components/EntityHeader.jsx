import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { Edit3, ZoomIn, X, Maximize2 } from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import EntityBadge from '@/domain/entity/components/EntityBadge';
import { getPriorityStyles } from '@/domain/entity/config/entityStyles';

/**
 * Premium Fullscreen Image Viewer
 */
const ImageLightbox = ({ src, alt, onClose }) => {
	// Lock body scroll & Handle Escape Key
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
			{/* Content Wrapper - Shrinks to fit image */}
			<div
				className='relative inline-block shadow-2xl rounded-lg overflow-hidden bg-black/5 ring-1 ring-black/10'
				onClick={(e) => e.stopPropagation()}>
				{/* Image */}
				<img src={src} alt={alt} className='max-w-[85vw] max-h-[85vh] object-contain block select-none' />

				{/* Close Button - Pinned to Image */}
				<button
					onClick={onClose}
					className='absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white/90 hover:text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-sm'
					title='Close (Esc)'>
					<X size={18} strokeWidth={2.5} />
				</button>
			</div>
		</div>,
		document.body
	);
};

/**
 * EntityHeader Component
 */
export const EntityHeader = ({ data }) => {
	const { title, typeLabel, imageUrl, avatarUrl, status, priority, extraTags } = data;
	const { entityId } = useParams();
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	// Only show edit controls in Dev mode
	const isDev = import.meta.env.DEV;

	return (
		<>
			<div
				className={clsx(
					// HEIGHT ADJUSTMENT: Increased base height and md height
					'h-48 md:h-64 relative group overflow-hidden header-bg-fallback select-none',
					imageUrl && 'cursor-pointer'
				)}
				onClick={() => imageUrl && setIsLightboxOpen(true)}>
				{/* 1. BACKGROUND LAYER (Banner) */}
				{imageUrl && (
					<>
						<img
							src={imageUrl}
							alt={title}
							className={clsx(
								'absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out',
								// Start position: Center-Top (Focuses on faces/landscapes usually in upper 3rd)
								// Hover position: True Center (Slow pan effect)
								'object-[center_30%] group-hover:object-[center_50%] group-hover:scale-105'
							)}
						/>

						{/* Subtler Zoom Hint */}
						<div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'>
							<div className='bg-black/30 backdrop-blur-md p-2 rounded-full text-white/80 border border-white/10 shadow-lg'>
								<Maximize2 size={16} />
							</div>
						</div>
					</>
				)}

				{/* GRADIENT MASK */}
				<div className='absolute inset-0 bg-gradient-to-t from-[var(--background)] from-0% via-[var(--background)]/60 via-15% to-transparent pointer-events-none' />

				{/* 2. DEVELOPER ACTION BAR */}
				{isDev && entityId && (
					<div
						className='absolute top-4 right-4 z-30 animate-in fade-in slide-in-from-right-2 duration-500'
						onClick={(e) => e.stopPropagation()} // Prevent lightbox trigger
					>
						<Link
							to={`/dm/manage/${typeLabel.toLowerCase()}/${entityId}`}
							className='flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg text-muted-foreground hover:text-amber-700 hover:border-amber-500/50 transition-all group/edit'
							title='Edit in DM Console'>
							<Edit3 size={14} className='group-hover/edit:scale-110 transition-transform' />
							<span className='text-[10px] font-bold uppercase tracking-tight'>Quick Edit</span>
						</Link>
					</div>
				)}

				{/* 3. CONTENT LAYER */}
				<div className='absolute bottom-0 left-0 w-full p-4 md:p-6 pointer-events-none'>
					<div className='max-w-6xl mx-auto flex items-end gap-5'>
						{/* AVATAR - Slightly larger to match new height */}
						<div className='hidden md:flex md:items-end pointer-events-auto'>
							<EntityIcon
								type={typeLabel.toLowerCase()}
								customIconUrl={avatarUrl}
								size={36}
								showBackground
								className='w-20 h-20 shadow-xl border-2 border-background/50'
							/>
						</div>

						{/* Title & Status Metadata */}
						<div className='flex-1 pb-1'>
							<div className='flex items-center flex-wrap gap-2 mb-2'>
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
											getPriorityStyles(priority)
										)}>
										{priority} Priority
									</span>
								)}

								{/* Extra Tags (Session Date, etc) */}
								{extraTags &&
									extraTags.map((tag, i) => (
										<span
											key={i}
											className='px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm bg-white/80 border-slate-300 text-slate-700'>
											{tag}
										</span>
									))}
							</div>

							<h1 className='text-3xl md:text-5xl font-serif font-bold text-foreground leading-none drop-shadow-sm tracking-tight'>
								{title}
							</h1>
						</div>
					</div>
				</div>
			</div>

			{/* Lightbox Portal */}
			{isLightboxOpen && imageUrl && (
				<ImageLightbox src={imageUrl} alt={title} onClose={() => setIsLightboxOpen(false)} />
			)}
		</>
	);
};
