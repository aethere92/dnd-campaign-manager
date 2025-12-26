import { Link } from 'react-router-dom';
import { Swords, Skull } from 'lucide-react';
import { clsx } from 'clsx';

export const RecentEncountersWidget = ({ encounters }) => {
	return (
		<div className='bg-background border border-border rounded-lg shadow-sm overflow-hidden'>
			<div className='px-4 py-3 bg-muted border-b border-border flex items-center justify-between'>
				<h3 className='text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
					<Swords size={14} className='text-red-600' />
					Recent Encounters
				</h3>
				<span className='text-xs font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border'>
					{encounters.length}
				</span>
			</div>
			<div className='divide-y divide-border'>
				{encounters.map((encounter) => (
					<Link
						key={encounter.id}
						to={`/wiki/encounter/${encounter.id}`}
						className='block px-4 py-3 hover:bg-muted/50 transition-colors group'>
						<div className='flex items-start gap-3'>
							<Skull size={16} className='text-red-500 shrink-0 mt-0.5' strokeWidth={2.5} />
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-0.5'>
									{encounter.name}
								</p>
								{encounter.session && (
									<p className='text-xs text-muted-foreground'>Session {encounter.session.session_number - 1}</p>
								)}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};
