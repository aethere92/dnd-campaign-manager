import { Drawer } from 'vaul';
import { Info, X } from 'lucide-react';

/**
 * Bottom sheet with a floating "Info" trigger, for surfacing sidebar content on
 * mobile where there's no room for a sidebar.
 *
 * Extracted from StandardLayout and CharacterLayout, which had drifted apart on
 * z-index (`z-50` vs `z-[60]`) and drag-handle colour (hardcoded `bg-gray-300`
 * vs the theme-aware `bg-muted-foreground/30`). The theme-aware values won.
 *
 * @param {string} title - Sheet heading
 * @param {React.ReactNode} children - Sheet body
 * @param {string} [triggerLabel='Info']
 */
export default function MobileInfoSheet({ title, children, triggerLabel = 'Info' }) {
	return (
		<div className='lg:hidden'>
			<Drawer.Root shouldScaleBackground>
				<Drawer.Trigger asChild>
					<button
						className='fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 bg-background text-foreground border border-border rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform hover:border-primary/50'
						aria-label={`Open ${title}`}>
						<Info size={18} />
						<span>{triggerLabel}</span>
					</button>
				</Drawer.Trigger>

				<Drawer.Portal>
					<Drawer.Overlay className='fixed inset-0 bg-black/60 z-[60] backdrop-blur-[2px]' />
					<Drawer.Content className='bg-background flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[60] focus:outline-none border-t border-border'>
						{/* Drag handle + header */}
						<div className='p-4 bg-muted/30 rounded-t-[10px] flex-shrink-0 border-b border-border'>
							<div className='mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mb-4' />
							<div className='flex justify-between items-center'>
								<Drawer.Title className='font-serif font-bold text-xl text-foreground'>{title}</Drawer.Title>
								<Drawer.Close
									className='p-2 bg-muted/50 hover:bg-muted rounded-full text-muted-foreground transition-colors'
									aria-label='Close'>
									<X size={18} />
								</Drawer.Close>
							</div>
						</div>

						<div className='p-4 overflow-y-auto custom-scrollbar flex-1'>{children}</div>
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root>
		</div>
	);
}
