import { useNavigate } from 'react-router-dom';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
export const PartyWidget = ({ party }) => {
	const navigate = useNavigate();
	if (!party || party.length === 0) return null;

	const handleRowClick = (id, e) => {
		// Integrity Check:
		// If the user clicked an actual link inside the SmartMarkdown (e.g. the name),
		// we stop the row click so we don't navigate twice or conflict.
		if (e.target.closest('a')) return;

		navigate(`/wiki/character/${id}`);
	};

	return (
		<div className='h-full flex flex-col'>
			<div className='flex items-center justify-between mb-6 shrink-0'>
				<h4 className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>The Party</h4>
			</div>

			<div className='space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2'>
				{party.map((char) => (
					<div
						key={char.id}
						onClick={(e) => handleRowClick(char.id, e)}
						className='flex items-center gap-3 group cursor-pointer'>
						<div className='w-10 h-10 rounded-full bg-muted border border-border overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors shadow-sm'>
							{char.icon ? (
								<img src={char.icon} alt={char.name} className='w-full h-full object-cover' />
							) : (
								<div className='w-full h-full flex items-center justify-center text-sm font-serif font-bold text-muted-foreground'>
									{char.name[0]}
								</div>
							)}
						</div>

						<div className='min-w-0'>
							<div className='font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate'>
								{/* SmartMarkdown is now safe here because parent is a div */}
								<SmartMarkdown>{char.name}</SmartMarkdown>
							</div>
							<div className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate opacity-60 group-hover:opacity-100 transition-opacity'>
								{char.race} • {char.class} • Lvl {char.level}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
