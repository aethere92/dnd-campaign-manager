import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useCampaign } from '@/features/campaign/CampaignContext';
import { routes } from '@/app/routes';

/**
 * A real 404.
 *
 * The app previously routed every unmatched path to the dashboard with
 * `<Route path='*' element={<Navigate to='/' />} />`. For a wiki that gets linked
 * into session notes that is actively harmful: a dead link silently lands on the
 * dashboard and looks like it worked, so broken links are never noticed. Showing
 * the path that failed makes them fixable.
 */
export const NotFound = ({ title = 'Page not found', detail }) => {
	const location = useLocation();
	const { campaignId } = useCampaign();

	const homeTo = campaignId ? routes.campaign.root(campaignId) : routes.selectCampaign();

	return (
		<div className='flex h-full min-h-[60vh] w-full items-center justify-center p-8'>
			<div className='max-w-md text-center'>
				<Compass size={48} strokeWidth={1.25} className='mx-auto mb-6 text-muted-foreground/50' />

				<h1 className='mb-3 font-serif text-2xl font-bold text-foreground'>{title}</h1>

				{detail && <p className='mb-4 text-sm text-muted-foreground'>{detail}</p>}

				<p className='mb-6 break-all rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground'>
					{location.pathname}
				</p>

				<div className='flex items-center justify-center gap-3'>
					<Link
						to={homeTo}
						className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
						{campaignId ? 'Back to dashboard' : 'Choose a campaign'}
					</Link>
					<Link
						to={routes.selectCampaign()}
						className='rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
						Switch campaign
					</Link>
				</div>
			</div>
		</div>
	);
};
