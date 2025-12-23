import { History, Diamond } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';
import { EntityHistory } from './EntityHistory';
import { QuestObjectives } from './QuestObjectives'; // Import
import { SectionDivider } from '../../../components/ui/SectionDivider'; // Import

// Re-exporting History for use in tabs if needed by parent
export { EntityHistory } from './EntityHistory';

// ... (LevelUpBanner component remains here or moves to own file) ...
// For brevity, assuming LevelUpBanner is kept or moved similarly.

export const EntityBody = ({ summary, sections, history, objectives, levelUp }) => {
	return (
		<div className='prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-p:text-slate-700 prose-p:text-[11pt] prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-strong:font-bold prose-li:marker:text-amber-600 prose-li:text-sm prose-li:my-0.5 prose-p:text-justify'>
			{summary && (
				<div className='mb-4'>
					<SmartMarkdown>{summary}</SmartMarkdown>
				</div>
			)}

			{/* Quest Objectives Component */}
			{objectives && objectives.length > 0 && (
				<>
					<SectionDivider />
					<QuestObjectives objectives={objectives} />
				</>
			)}

			{/* Narrative Sections */}
			{sections.map((prop) => {
				if (prop.displayType === 'list' && Array.isArray(prop.value)) {
					return (
						<div key={prop.key}>
							<SectionDivider />
							<h3 className='capitalize text-lg mt-0 font-serif text-accent mb-2 font-bold'>{prop.key}</h3>
							<ul className='grid grid-cols-1 gap-1.5 pl-1 list-none my-0'>
								{prop.value.map((item, idx) => (
									<li key={idx} className='flex items-start gap-3 m-0 p-0 text-foreground group'>
										<div className='mt-[0.45rem] shrink-0 text-accent/60 group-hover:text-accent transition-colors'>
											<Diamond size={8} fill='currentColor' />
										</div>
										<span className='text-[11pt] leading-snug'>
											<SmartMarkdown components={{ p: 'span' }}>{item}</SmartMarkdown>
										</span>
									</li>
								))}
							</ul>
						</div>
					);
				}
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

			{history && history.length > 0 && (
				<div className='mt-2'>
					<SectionDivider />
					<h3 className='font-serif text-lg mt-0 font-bold text-foreground mb-3 flex items-center gap-2'>
						<History size={16} className='text-accent' /> Events
					</h3>
					<EntityHistory events={history} />
				</div>
			)}

			{/* LevelUpBanner logic... */}
		</div>
	);
};
