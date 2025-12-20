import { History, Calendar } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';

export const EntityHistory = ({ events, showSession = true }) => {
	if (!events || events.length === 0) return null;

	return (
		<div className='border-l-2 border-slate-200 pl-4 space-y-6 relative my-2'>
			{events.map((evt, idx) => (
				<div key={evt.id || idx} className='relative group'>
					<div className='absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border border-white bg-slate-300 ring-1 ring-slate-200 group-hover:bg-amber-500 group-hover:ring-amber-200 transition-colors shadow-sm' />

					{/* Title Row with Session Badge */}
					<div className='flex items-center gap-2 mb-1 flex-wrap'>
						<h4 className='font-bold text-slate-800 text-sm mt-0.5'>{evt.title}</h4>
						{showSession && evt.session_number != null && (
							<span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200'>
								<Calendar size={9} />
								Session {evt.session_number}
							</span>
						)}
					</div>

					<div className='text-sm text-slate-600 leading-relaxed text-justify'>
						<SmartMarkdown>{evt.description}</SmartMarkdown>
					</div>
				</div>
			))}
		</div>
	);
};
