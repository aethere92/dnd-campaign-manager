import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, BookOpen, Clock, History } from 'lucide-react';
import { formatDate } from '@/shared/utils/textUtils';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { clsx } from 'clsx';

export const CurrentStoryStack = ({ latestSession, previousSessions }) => {
	if (!latestSession) return null;

	const bgImage = latestSession.image;
	// If no previous sessions, the list section is hidden and hero takes full height
	const hasHistory = previousSessions && previousSessions.length > 0;

	return (
		<div className='flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden transition-all duration-500 group'>
			{/* --- TOP SECTION: LATEST SESSION (HERO) --- */}
			{/* flex-1 ensures it fills all available space not taken by the list */}
			<div className='relative flex-1 min-h-[300px] flex flex-col overflow-hidden'>
				{/* Background Image Layer */}
				<div className='absolute inset-0 z-0'>
					{bgImage ? (
						<img
							src={bgImage}
							alt='Session Background'
							className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
						/>
					) : (
						<div className='w-full h-full bg-muted/20 flex items-center justify-center'>
							<BookOpen size={64} className='text-muted-foreground/10' />
						</div>
					)}
					{/* Gradient: Darkens text area, fades to transparent at top */}
					<div className='absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent opacity-90' />
				</div>

				{/* Content Layer */}
				<div className='relative z-10 p-8 flex flex-col h-full'>
					{/* Badge */}
					<div className='flex justify-between items-start mb-auto'>
						<div className='bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest hover:shadow-sm'>
							Latest Session
						</div>
						{/* Date */}
						<div className='text-[10px] font-bold text-muted-foreground bg-background/50 backdrop-blur px-2 py-1 rounded border border-white/10 flex items-center gap-1'>
							<Calendar size={10} />
							{formatDate(latestSession.session_date)}
						</div>
					</div>

					{/* Text Content */}
					<div className='mt-8'>
						<span className='text-xs font-bold text-primary mb-1 block uppercase tracking-wider'>
							Session {latestSession.session_number}
						</span>

						<h3 className='text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors'>
							{latestSession.title}
						</h3>

						<div className='text-sm text-muted-foreground line-clamp-6 mb-6 prose prose-invert max-w-none leading-relaxed'>
							<SmartMarkdown components={{ p: 'span' }}>
								{latestSession.narrative || 'No summary recorded.'}
							</SmartMarkdown>
						</div>

						<Link
							to={`/wiki/session/${latestSession.id}`}
							className='inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20'>
							Read Full Log <ArrowRight size={14} />
						</Link>
					</div>
				</div>
			</div>

			{/* --- BOTTOM SECTION: PREVIOUS CHAPTERS (LIST) --- */}
			{/* flex-none ensures it only takes the space it needs */}
			{hasHistory && (
				<div className='flex-none bg-muted/30 border-t border-border p-6'>
					<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2'>
						<History size={12} /> Previous Chapters
					</h4>

					<div className='space-y-1'>
						{previousSessions.map((session) => (
							<Link
								key={session.id}
								to={`/wiki/session/${session.id}`}
								className='flex items-center gap-3 p-2 rounded hover:bg-background/80 hover:shadow-sm border border-transparent hover:border-border transition-all group/item'>
								<span className='text-xs font-bold text-muted-foreground group-hover/item:text-primary w-8 text-center shrink-0 bg-background border border-border rounded px-1 py-0.5'>
									#{session.session_number}
								</span>
								<span className='text-sm font-medium truncate text-foreground/80 group-hover/item:text-foreground flex-1'>
									{session.title}
								</span>
								<span className='text-[10px] text-muted-foreground/50 whitespace-nowrap'>
									{formatDate(session.session_date)}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
