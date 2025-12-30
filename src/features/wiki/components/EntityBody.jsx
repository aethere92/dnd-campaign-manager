import { History, Diamond } from 'lucide-react';
import { clsx } from 'clsx';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import { EntityHistory } from './EntityHistory';
import { QuestObjectives } from './QuestObjectives';
import { SectionDivider } from '@/shared/components/ui/SectionDivider';
import { EncounterTimeline } from './EncounterTimeline';

// Re-exporting History for use in tabs if needed by parent
export { EntityHistory } from './EntityHistory';

const LevelUpBanner = ({ level }) => {
	const logoPath = `${import.meta.env.BASE_URL}logo_detailed.png`;

	return (
		<div className='mt-4 mb-6 w-full'>
			{/* Full Width, Fixed Height (~64px) Banner */}
			<div className='flex items-center h-16 bg-muted/60 border-y border-r border-border border-l-2 border-l-amber-700/80 rounded-lg shadow-sm w-full overflow-hidden'>
				{/* Logo Section - Vertical Center */}
				<div className='shrink-0 h-full flex items-center px-5 bg-amber-50/50 border-r border-border/40'>
					<img
						src={logoPath}
						alt='Campaign Logo'
						className='h-12 w-auto object-contain opacity-80 drop-shadow-sm mix-blend-multiply'
					/>
				</div>

				{/* Text Content */}
				<div className='flex-1 flex flex-col justify-center px-4'>
					<h3 className='text-xs font-serif font-bold text-amber-900 uppercase tracking-[0.15em] leading-none m-0! p-0!'>
						Level Up
					</h3>
					<p className='font-serif text-sm text-stone-700 leading-none p-0! m-0!'>
						The party has reached <span className='font-bold text-foreground'>Level {level}</span>.
					</p>
				</div>
			</div>
		</div>
	);
};

export const EntityBody = ({ summary, sections, history, objectives, combatRounds, levelUp }) => {
	return (
		<div className='prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-p:text-slate-700 prose-p:text-[11pt] prose-p:leading-relaxed prose-p:my-2 prose-strong:text-foreground prose-strong:font-bold prose-li:marker:text-amber-600 prose-li:text-sm prose-li:my-0.5 prose-p:text-justify'>
			{summary && (
				<div className='mb-4'>
					<SmartMarkdown>{summary}</SmartMarkdown>
				</div>
			)}

			{/* Quest Objectives */}
			{objectives && objectives.length > 0 && (
				<>
					<SectionDivider />
					<QuestObjectives objectives={objectives} />
				</>
			)}

			{/* Combat Timeline */}
			{combatRounds && Object.keys(combatRounds).length > 0 && (
				<>
					<SectionDivider />
					<EncounterTimeline rounds={combatRounds} />
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

			{/* Level Up Banner */}
			{levelUp && <LevelUpBanner level={levelUp} />}
		</div>
	);
};
