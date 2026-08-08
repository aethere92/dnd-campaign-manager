import { clsx } from 'clsx';

/**
 * Centred section heading: a small icon+CAPS eyebrow above a serif display line,
 * flanked by hairline rules. The recurring rhythm between dashboard sections.
 */
export function SectionHeading({ icon: Icon, eyebrow, title, className }) {
	return (
		<div className={clsx('text-center max-w-2xl mx-auto', className)}>
			<div className='flex items-center justify-center gap-3 mb-3'>
				<span className='hidden sm:block h-px w-16 bg-gradient-to-l from-border to-transparent' />
				<span className='inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground'>
					{Icon && <Icon size={13} className='text-primary' />}
					{eyebrow}
				</span>
				<span className='hidden sm:block h-px w-16 bg-gradient-to-r from-border to-transparent' />
			</div>
			<h2 className='font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight'>
				{title}
			</h2>
		</div>
	);
}
