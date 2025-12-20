import { History, Diamond } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';
import { EntityHistory } from './EntityHistory';

// Re-exporting History for use in tabs if needed by parent
export { EntityHistory } from './EntityHistory';

export const EntityBody = ({ summary, sections, history }) => {
	return (
		<div className='prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-p:text-slate-700 prose-p:text-[11pt] prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-strong:font-bold prose-li:marker:text-amber-600 prose-li:text-sm prose-li:my-0.5 prose-p:text-justify'>
			{/* Main Summary */}
			{summary && (
				<div className='mb-4'>
					<SmartMarkdown>{summary}</SmartMarkdown>
				</div>
			)}

			{/* Narrative Sections */}
			{sections.map((prop) => {
				// --- RENDERER: LISTS (Features, Traits, Inventory, etc) ---
				if (prop.displayType === 'list' && Array.isArray(prop.value)) {
					return (
						<div key={prop.key} className='mt-5 pt-2 border-t border-slate-100'>
							<h3 className='capitalize text-lg mt-4 font-serif text-amber-800 mb-2 font-bold'>{prop.key}</h3>

							{/* CLEAN LIST DESIGN */}
							<ul className='grid grid-cols-1 gap-1.5 pl-1 list-none my-0'>
								{prop.value.map((item, idx) => (
									<li key={idx} className='flex items-start gap-3 m-0 p-0 text-slate-700 group'>
										{/* Custom Bullet Point (Subtle Diamond) */}
										<div className='mt-[0.45rem] shrink-0 text-amber-600/60 group-hover:text-amber-600 transition-colors'>
											<Diamond size={8} fill='currentColor' />
										</div>

										{/* The Text */}
										{/* FIX: components={{ p: 'span' }} removes the <p> tag wrapper so alignment holds */}
										<span className='text-[11pt] leading-snug'>
											<SmartMarkdown components={{ p: 'span' }}>{item}</SmartMarkdown>
										</span>
									</li>
								))}
							</ul>
						</div>
					);
				}

				// --- RENDERER: STANDARD TEXT SECTIONS ---
				return (
					<div key={prop.key} className='mt-4 pt-2 border-t border-slate-200'>
						<h3 className='capitalize text-lg font-serif text-amber-800 mb-1 mt-2 inline-block pb-0.5'>{prop.key}</h3>
						<div className='mt-0.5'>
							<SmartMarkdown>{prop.value}</SmartMarkdown>
						</div>
					</div>
				);
			})}

			{/* History Section (Embedded) */}
			{history && history.length > 0 && (
				<div className='mt-4 pt-2 border-t border-slate-200'>
					<h3 className='font-serif text-lg mt-4 font-bold text-foreground mb-3 flex items-center gap-2'>
						<History size={16} className='text-amber-600' /> Events
					</h3>
					<EntityHistory events={history} />
				</div>
			)}
		</div>
	);
};
