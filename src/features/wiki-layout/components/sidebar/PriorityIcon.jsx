import { ChevronsUp, ChevronsDown, Minus, AlertCircle } from 'lucide-react';

export const PriorityIcon = ({ priority }) => {
	if (!priority) return null;
	const p = priority.toLowerCase();

	// High / Urgent
	if (p.includes('high') || p.includes('urgent') || p.includes('critical')) {
		return <ChevronsUp size={14} className='text-orange-600' strokeWidth={3} />;
	}

	// Low
	if (p.includes('low')) {
		return <ChevronsDown size={14} className='text-slate-400' strokeWidth={3} />;
	}

	// Medium / Normal
	if (p.includes('medium') || p.includes('normal')) {
		return <Minus size={14} className='text-blue-400' strokeWidth={3} />;
	}

	return null;
};
