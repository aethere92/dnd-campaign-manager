import { clsx } from 'clsx';

export const TocItem = ({ item, isActive, onClick }) => {
	return (
		<button
			onClick={() => onClick(item.id)}
			className={clsx(
				'group flex items-start text-left w-full py-1.5 transition-all duration-200 border-l-[3px] px-4',
				isActive
					? 'border-amber-600 text-amber-700 font-bold bg-amber-50/50'
					: 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
			)}>
			<span className={clsx('text-[13px] leading-snug', item.depth === 3 && 'ml-3 opacity-90 text-[12px]')}>
				{item.text}
			</span>
		</button>
	);
};
