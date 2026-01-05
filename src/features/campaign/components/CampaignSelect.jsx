import { useCampaignSelection } from '@/features/campaign/useCampaignSelection';
import { CampaignCard } from './CampaignCard';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { useTheme } from '@/shared/hooks/useTheme';
import { useMemo } from 'react';

export default function CampaignSelect() {
	// 1. Initialize Theme to ensure dark mode works on full-page reload
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const { campaigns, isLoading, selectCampaign } = useCampaignSelection();
	const logoPath = `${import.meta.env.BASE_URL}logo_detailed.png`;

	const backgroundStyle = useMemo(() => {
		if (isDark) {
			return {
				backgroundImage:
					'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px), radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)',
				backgroundSize: '40px 40px, 20px 20px',
				backgroundPosition: '0 0, 20px 20px',
				backgroundColor: 'var(--background)',
			};
		}
		return {
			backgroundColor: 'var(--background)',
			opacity: 0.9,
		};
	}, [isDark]);

	if (isLoading) {
		return (
			<div className='h-full w-full bg-muted flex flex-col items-center justify-center'>
				<LoadingSpinner size='lg' text='Consulting the Archives...' />
			</div>
		);
	}

	return (
		<div
			className='h-full w-full overflow-y-auto custom-scrollbar font-sans bg-background text-foreground'
			style={backgroundStyle}>
			<div className='min-h-full w-full flex items-center justify-center p-6 md:p-12'>
				<div className='max-w-6xl w-full mx-auto'>
					{/* Header Section */}
					<div className='text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700'>
						<img src={logoPath} alt='Logo' className='h-32 md:h-40 mx-auto mb-8 drop-shadow-2xl' />
						<h1 className='text-4xl md:text-5xl font-serif font-bold text-foreground mb-4'>Select Campaign</h1>
						<p className='text-muted-foreground text-lg max-w-xl mx-auto'>
							Choose a world to enter. Your adventures, characters, and chronicles await.
						</p>
					</div>

					{/* Grid Section */}
					<div className='flex flex-wrap justify-center gap-8 pb-8'>
						{campaigns.map((campaign) => (
							<div key={campaign.id} className='w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] max-w-sm'>
								<CampaignCard campaign={campaign} onSelect={selectCampaign} />
							</div>
						))}

						{campaigns.length === 0 && (
							<div className='w-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm'>
								<p className='text-muted-foreground/70 font-serif text-xl'>No campaigns found in the library.</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
