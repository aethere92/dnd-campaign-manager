import { Sparkles } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

export const AiAnswer = ({ answer }) => {
	return (
		<div className='mx-4 mt-3 mb-2'>
			<div className='flex items-center gap-2 mb-2'>
				<Sparkles size={13} className='text-purple-400' />
				<span className='text-[10px] font-bold uppercase tracking-widest text-purple-400'>AI Answer</span>
			</div>
			<div className='rounded-lg border border-purple-500/20 bg-purple-500/5 p-4'>
				<div className='prose prose-sm prose-invert max-w-none text-sm leading-relaxed
					prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5
					prose-strong:text-foreground prose-strong:font-semibold
					text-muted-foreground'>
					<SmartMarkdown>{answer}</SmartMarkdown>
				</div>
			</div>
		</div>
	);
};
