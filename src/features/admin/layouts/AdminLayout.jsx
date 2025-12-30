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
} from 'lucide-react';
import { useCampaign } from '@/features/campaign/CampaignContext';

const NavItem = ({ to, icon: Icon, label }) => {
	// ... (existing code) ...
	const location = useLocation();
	const isActive = location.pathname.includes(to);

	return (
		<Link
			to={to}
			className={clsx(
				'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
				isActive
					? 'bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200'
					: 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
			)}>
			<Icon size={15} className={isActive ? 'text-amber-700' : 'opacity-70'} />
			{label}
		</Link>
	);
};

export default function AdminLayout() {
	const { campaignId, setCampaignId } = useCampaign();
	const navigate = useNavigate();

	// ... (existing handleSwitch logic) ...
	const handleSwitch = () => {
		if (confirm('Go to Campaign Selection screen?')) {
			setCampaignId(null);
			navigate('/select-campaign');
		}
	};

	return (
		<div className='flex h-screen bg-muted/30 text-foreground overflow-hidden font-sans'>
			{/* Sidebar */}
			<aside className='w-56 bg-background border-r border-border flex flex-col shrink-0'>
				{/* ... (existing sidebar content) ... */}
				<div className='p-4 border-b border-border bg-muted/20'>
					<div className='flex items-center gap-2 text-amber-700'>
						<div className='p-1.5 bg-amber-100 rounded-md'>
							<Database size={18} />
						</div>
						<h2 className='font-serif font-bold text-lg leading-none'>DM Console</h2>
					</div>
				</div>

				<nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>
					{/* ... (existing nav items) ... */}
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
					<NavItem to='/dm/manage/session' icon={BookOpen} label='Sessions' />
					<NavItem to='/dm/manage/quest' icon={Scroll} label='Quests' />
				</nav>

				<div className='p-3 border-t border-border space-y-1'>
					{/* ... (existing footer buttons) ... */}
					{campaignId && (
						<Link
							to='/'
							className='flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors'
							title={`Return to Campaign ID: ${campaignId}`}>
							<Play size={14} /> Enter Campaign
						</Link>
					)}

					<button
						onClick={handleSwitch}
						className='flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-left'>
						<LogOut size={14} /> Campaign Select
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className='flex-1 h-full overflow-y-auto bg-muted/10 custom-scrollbar'>
				<div className='mx-auto'>
					<Outlet />
				</div>
			</main>
		</div>
	);
}
