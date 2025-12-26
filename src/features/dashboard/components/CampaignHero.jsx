import { Sparkles, Calendar, MapPin, Users, Swords } from 'lucide-react';
import { clsx } from 'clsx';

export const CampaignHero = ({ campaign, stats }) => {
	const logoPath = `${import.meta.env.BASE_URL}logo_detailed.png`;

	return (
		<div className='relative overflow-hidden bg-gradient-to-br from-amber-50 via-background to-background border-b border-border'>
			{/* Background Pattern */}
			<div
				className='absolute inset-0 opacity-[0.03]'
				style={{
					backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
					backgroundSize: '40px 40px',
				}}
			/>

			<div className='relative max-w-[1600px] mx-auto px-4 sm:px-6 py-12 md:py-16'>
				<div className='flex flex-col md:flex-row md:items-center gap-8'>
					{/* Logo */}
					<div className='shrink-0'>
						<img src={logoPath} alt='Campaign Logo' className='h-32 md:h-40 drop-shadow-lg opacity-90' />
					</div>

					{/* Campaign Info */}
					<div className='flex-1'>
						<div className='flex items-center gap-3 mb-3'>
							<Sparkles size={20} className='text-amber-600' />
							<span className='text-xs font-bold uppercase tracking-widest text-amber-600'>Campaign Chronicle</span>
						</div>
						<h1 className='text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight'>
							{campaign?.name || 'Your Campaign'}
						</h1>
						{campaign?.description && (
							<p className='text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl'>
								{campaign.description}
							</p>
						)}
					</div>

					{/* Stats Grid */}
					<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 md:gap-6'>
						<StatBadge icon={Calendar} label='Sessions' value={stats?.totalSessions || 0} />
						<StatBadge icon={Swords} label='Encounters' value={stats?.totalEncounters || 0} />
						<StatBadge icon={Users} label='NPCs Met' value={stats?.uniqueNPCs || 0} />
						<StatBadge icon={MapPin} label='Locations' value={stats?.uniqueLocations || 0} />
					</div>
				</div>
			</div>
		</div>
	);
};

const StatBadge = ({ icon: Icon, label, value }) => (
	<div className='bg-background/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
		<div className='flex items-center gap-2 text-muted-foreground mb-1'>
			<Icon size={14} strokeWidth={2.5} />
			<span className='text-[10px] font-bold uppercase tracking-wider'>{label}</span>
		</div>
		<p className='text-3xl font-serif font-bold text-foreground'>{value}</p>
	</div>
);
