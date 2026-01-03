import { Link } from 'react-router-dom';
import { ChevronRight, Folder } from 'lucide-react';
import { useState } from 'react';

export const ArchiveTree = ({ arcs }) => {
	return (
		<div className='bg-card border border-border rounded-xl p-6 h-full overflow-hidden flex flex-col'>
			<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2'>
				<Folder size={12} /> Campaign Archive
			</h4>

			<div className='flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4'>
				{arcs.map((arc) => (
					<ArchiveArcItem key={arc.id} arc={arc} />
				))}
				{arcs.length === 0 && (
					<div className='text-xs text-muted-foreground italic opacity-50 text-center py-8'>
						No archived arcs found.
					</div>
				)}
			</div>
		</div>
	);
};

const ArchiveArcItem = ({ arc }) => {
	// MODIFICATION: Default to true
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex items-center justify-between text-left group mb-1 hover:bg-muted/50 p-1 rounded transition-colors'>
				<div className='min-w-0'>
					<div className='text-[10px] font-bold uppercase text-muted-foreground group-hover:text-primary'>
						Arc {arc.order}
					</div>
					<div className='text-sm font-serif font-bold truncate text-foreground'>{arc.title}</div>
				</div>
				<ChevronRight size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
			</button>

			{isOpen && (
				<div className='pl-3 ml-1 border-l border-border mt-1 space-y-1 mb-3 animate-in slide-in-from-top-1 duration-200'>
					{arc.sessions.map((session) => (
						<Link
							key={session.id}
							to={`/wiki/session/${session.id}`}
							className='block text-xs py-1.5 px-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 truncate transition-colors'>
							<span className='font-bold mr-2 opacity-50'>#{session.session_number}</span>
							{session.title}
						</Link>
					))}
				</div>
			)}
		</div>
	);
};
