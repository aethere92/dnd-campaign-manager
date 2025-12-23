import { History, Diamond, CheckCircle2, Circle, XCircle, Target } from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '../../smart-text/SmartMarkdown';
import { EntityHistory } from './EntityHistory';

// Re-exporting History for use in tabs if needed by parent
export { EntityHistory } from './EntityHistory';

/**
 * Thematic separator for sections
 * "Line - Diamond - Line" style
 */
const SectionDivider = () => (
	<div className='flex items-center gap-4 my-6 opacity-80 select-none'>
		<div className='h-px bg-border flex-1' />
		<div className='flex-shrink-0 text-accent/50'>
			<Diamond size={10} fill='currentColor' />
		</div>
		<div className='h-px bg-border flex-1' />
	</div>
);

export const EntityBody = ({ summary, sections, history, objectives }) => {
	return (
		<div className='prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-p:text-slate-700 prose-p:text-[11pt] prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-strong:font-bold prose-li:marker:text-amber-600 prose-li:text-sm prose-li:my-0.5 prose-p:text-justify'>
			{/* Main Summary */}
			{summary && (
				<div className='mb-4'>
					<SmartMarkdown>{summary}</SmartMarkdown>
				</div>
			)}

			{/* --- QUEST OBJECTIVES (Themed) --- */}
			{objectives && objectives.length > 0 && (
				<>
					{/* Divider to separate description from objectives */}
					<SectionDivider />

					<div className='mb-8 not-prose border border-stone-200 rounded-lg overflow-hidden bg-background'>
						{/* Header matching Sidebar Attributes style */}
						<div className='px-3 py-2 border-b border-stone-200 bg-stone-100/40 flex items-center gap-2'>
							<h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 m-0'>
								<Target size={12} className='text-accent' /> Quest Objectives
							</h3>
						</div>

						{/* List Items */}
						<div className='divide-y divide-border/50'>
							{objectives.map((obj, idx) => {
								const isCompleted = obj.status === 'completed';
								const isFailed = obj.status === 'failed';

								return (
									<div
										key={obj.id || idx}
										className={clsx(
											'flex items-start gap-3 px-3 py-2.5 transition-colors',
											isCompleted
												? 'bg-emerald-50/30' // Subtle green tint
												: isFailed
												? 'bg-red-50/30' // Subtle red tint
												: 'hover:bg-muted/50' // Hover effect for active
										)}>
										{/* Status Icon */}
										<div className='mt-0.5 shrink-0'>
											{isCompleted ? (
												<CheckCircle2 size={14} className='text-emerald-600' />
											) : isFailed ? (
												<XCircle size={14} className='text-red-500' />
											) : (
												<Circle size={14} className='text-muted-foreground/40' strokeWidth={2} />
											)}
										</div>

										{/* Text Content */}
										<div className='flex-1 min-w-0'>
											<p
												className={clsx(
													'text-[13px] leading-snug m-0',
													isCompleted
														? 'text-muted-foreground'
														: isFailed
														? 'text-red-800/80'
														: 'text-foreground font-medium'
												)}>
												{obj.description}
											</p>
											{/* Optional Sub-label for specific objective categories */}
											{obj.objective_name && (
												<span className='block text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider mt-1'>
													{obj.objective_name}
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</>
			)}

			{/* Narrative Sections */}
			{sections.map((prop) => {
				// --- RENDERER: LISTS (Features, Traits, Inventory, etc) ---
				if (prop.displayType === 'list' && Array.isArray(prop.value)) {
					return (
						<div key={prop.key}>
							<SectionDivider />
							<h3 className='capitalize text-lg mt-0 font-serif text-accent mb-2 font-bold'>{prop.key}</h3>

							{/* CLEAN LIST DESIGN */}
							<ul className='grid grid-cols-1 gap-1.5 pl-1 list-none my-0'>
								{prop.value.map((item, idx) => (
									<li key={idx} className='flex items-start gap-3 m-0 p-0 text-foreground group'>
										{/* Custom Bullet Point */}
										<div className='mt-[0.45rem] shrink-0 text-accent/60 group-hover:text-accent transition-colors'>
											<Diamond size={8} fill='currentColor' />
										</div>

										{/* The Text */}
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
					<div key={prop.key}>
						<SectionDivider />
						<h3 className='capitalize text-lg font-serif text-accent mb-1 mt-0 inline-block pb-0.5'>{prop.key}</h3>
						<div className='mt-0.5'>
							<SmartMarkdown>{prop.value}</SmartMarkdown>
						</div>
					</div>
				);
			})}

			{/* History Section (Embedded) */}
			{history && history.length > 0 && (
				<div className='mt-2'>
					<SectionDivider />
					<h3 className='font-serif text-lg mt-0 font-bold text-foreground mb-3 flex items-center gap-2'>
						<History size={16} className='text-accent' /> Events
					</h3>
					<EntityHistory events={history} />
				</div>
			)}
		</div>
	);
};
