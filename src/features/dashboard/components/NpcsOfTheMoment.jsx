import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { getEntityConfig } from '@/domain/entity/config/entityConfig';

export const NpcsOfTheMoment = ({ npcs }) => {
	if (!npcs?.length) return null;
	const config = getEntityConfig('npc');

	return (
		<div className='bg-background border border-border rounded-lg shadow-sm overflow-hidden'>
			<div className='px-4 py-3 bg-muted border-b border-border flex items-center justify-between'>
				<h3 className='text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2'>
					<Users size={14} className='text-primary' />
					NPCs of the Moment
				</h3>
			</div>
			<div className='p-4 flex flex-wrap gap-3'>
				{npcs.map((npc) => (
					<Link key={npc.id} to={`/wiki/npc/${npc.id}`} className={`flex flex-col items-center gap-2 group w-20`}>
						<div
							className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${config.tailwind.bg} ${config.tailwind.border}`}>
							<span className='text-lg font-bold'>{npc.name[0]}</span>
						</div>
						<span className='text-[10px] font-bold text-center text-foreground group-hover:text-primary transition-colors line-clamp-2'>
							{npc.name}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
};
