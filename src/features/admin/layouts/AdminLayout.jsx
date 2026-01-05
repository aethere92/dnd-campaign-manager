import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
	Database,
	Users,
	MapPin,
	BookOpen,
	Scroll,
	ArrowLeft,
	Shield,
	Gem,
	LogOut,
	Play,
	Sword,
	Replace,
	Drama,
	Sun,
	Moon,
	Dice5, // Icon for D&D mode
} from 'lucide-react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { useTheme, THEMES } from '@/shared/hooks/useTheme'; // Import constant too

const NavItem = ({ to, icon: Icon, label }) => {
	const location = useLocation();
	const isActive = location.pathname.includes(to);

	return (
		<Link
			to={to}
			className={clsx(
				'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
				isActive
					? 'bg-card text-primary shadow-sm ring-1 ring-amber'
					: 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
			)}>
			<Icon size={15} className={isActive ? 'text-primary' : 'opacity-70'} />
			{label}
		</Link>
	);
};

export default function AdminLayout() {
	const { campaignId, setCampaignId } = useCampaign();
	const { theme, cycleTheme } = useTheme(); // Use cycleTheme
	const navigate = useNavigate();

	const handleSwitch = () => {
		if (confirm('Go to Campaign Selection screen?')) {
			setCampaignId(null);
			navigate('/select-campaign');
		}
	};

	// Helper to render current theme icon
	const ThemeIcon = () => {
		if (theme === THEMES.DARK) return <Moon size={16} />;
		if (theme === THEMES.DND) return <Dice5 size={16} />;
		return <Sun size={16} />;
	};

	return (
		<div className='flex h-screen bg-muted/30 text-foreground overflow-hidden font-sans '>
			{/* Sidebar */}
			<aside className='w-56 bg-background border-r border-border flex flex-col shrink-0'>
				<div className='p-4 border-b border-border bg-muted/20 flex items-center justify-between'>
					<div className='flex items-center gap-2 text-primary'>
						<div className='p-1.5 bg-primary  rounded-md'>
							<Database size={18} />
						</div>
						<h2 className='font-serif font-bold text-lg leading-none'>DM Console</h2>
					</div>

					{/* THEME TOGGLE BUTTON */}
					<button
						onClick={cycleTheme}
						className='p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors hover:text-foreground'
						title={`Current Theme: ${theme}`}>
						<ThemeIcon />
					</button>
				</div>

				<nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>
					<div className='px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60'>
						System
					</div>
					<NavItem to='/dm/manage/campaign' icon={Database} label='Campaigns' />
					<NavItem to='/dm/tools/replace' icon={Replace} label='Find & Replace' />

					<div className='mt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60'>
						Entities
					</div>
					<NavItem to='/dm/manage/character' icon={Users} label='Characters' />
					<NavItem to='/dm/manage/npc' icon={Users} label='NPCs' />
					<NavItem to='/dm/manage/location' icon={MapPin} label='Locations' />
					<NavItem to='/dm/manage/faction' icon={Shield} label='Factions' />
					<NavItem to='/dm/manage/item' icon={Gem} label='Items' />
					<NavItem to='/dm/manage/encounter' icon={Sword} label='Encounters' />

					<div className='mt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60'>
						Campaign
					</div>
					<NavItem to='/dm/manage/session' icon={BookOpen} label='Chronicles' />
					<NavItem to='/dm/manage/narrative_arc' icon={Drama} label='Narrative Arcs' />
					<NavItem to='/dm/manage/quest' icon={Scroll} label='Quests' />
				</nav>

				<div className='p-3 border-t border-border space-y-1'>
					{campaignId && (
						<Link
							to='/'
							className='flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-500/10 rounded-md transition-colors dark:text-emerald-400 dark:hover:bg-emerald-900/20'
							title={`Return to Campaign ID: ${campaignId}`}>
							<Play size={14} /> Enter Campaign
						</Link>
					)}

					<button
						onClick={handleSwitch}
						className='flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors text-left dark:hover:text-red-400 dark:hover:bg-red-900/20'>
						<LogOut size={14} /> Campaign Select
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className='flex-1 h-full overflow-y-auto custom-scrollba'>
				<div className='mx-auto'>
					<Outlet />
				</div>
			</main>
		</div>
	);
}
