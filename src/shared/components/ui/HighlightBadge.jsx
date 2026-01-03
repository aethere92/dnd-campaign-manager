export const HighlightBadge = ({ icon: Icon, count, label }) => {
	if (!count) return null;
	return (
		<div className='flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground'>
			<Icon size={12} className='text-primary/70' />
			<span>
				{count} {label}
			</span>
		</div>
	);
};
