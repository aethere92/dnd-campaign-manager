import { Moon, Sun, Sword, Settings } from 'lucide-react';
import { useTheme, THEMES } from '@/shared/hooks/useTheme';

export const SidebarFooter = ({ onSwitch }) => {
	const { theme, cycleTheme } = useTheme();

	const getThemeIcon = () => {
		switch (theme) {
			case THEMES.DARK:
				return <Moon size={14} className='mr-2' />;
			case THEMES.DND:
				return <Sword size={14} className='mr-2' />;
			default:
				return <Sun size={14} className='mr-2' />;
		}
	};

	const getThemeLabel = () => {
		switch (theme) {
			case THEMES.DARK:
				return 'Dark Mode';
			case THEMES.DND:
				return 'D&D PHB';
			default:
				return 'Light Mode';
		}
	};

	return (
		<div className='mt-auto p-4 border-t border-border space-y-2 bg-inherit'>
			<button
				onClick={cycleTheme}
				className='flex items-center w-full px-2 py-2 text-xs font-medium text-gray-500 hover:text-foreground hover:bg-black/5 rounded-md transition-colors'>
				{getThemeIcon()}
				Theme: {getThemeLabel()}
			</button>

			<button
				onClick={onSwitch}
				className='flex items-center w-full px-2 py-2 text-xs text-gray-500 hover:text-foreground hover:bg-black/5 rounded-md transition-colors'>
				<Settings size={14} className='mr-2' />
				Switch Campaign
			</button>
		</div>
	);
};
