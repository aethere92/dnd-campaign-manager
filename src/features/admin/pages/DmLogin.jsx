import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { setDmPassword, clearDmPassword } from '@/shared/api/dmSession';
import { verifyDmPassword } from '@/features/campaign/api/campaignService';
import { routes } from '@/app/routes';
import Button from '@/shared/components/ui/Button';

/**
 * DM sign-in.
 *
 * There is no password stored in the app to compare against — the only
 * authoritative copy lives in the database (check_dm_password()). So this stashes
 * whatever is typed into the session, then confirms it by attempting a harmless
 * no-op write (verifyDmPassword). If the database accepts it, we proceed to the
 * campaign picker; if not, we clear it and show an error. The password is never
 * bundled and never leaves this browser except as the request header.
 */
export default function DmLogin() {
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [checking, setChecking] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!password || checking) return;

		setChecking(true);
		setError('');

		// Set first, because verifyDmPassword relies on supabaseClient reading it
		// from the session to build the request header.
		setDmPassword(password);

		try {
			const ok = await verifyDmPassword();
			if (ok) {
				// Land on campaign selection, as requested; the DM console's own
				// switcher takes over from there.
				navigate(routes.selectCampaign());
			} else {
				clearDmPassword();
				setError('Incorrect password.');
			}
		} catch (err) {
			clearDmPassword();
			setError(`Could not verify: ${err.message}`);
		} finally {
			setChecking(false);
		}
	};

	return (
		<div className='min-h-screen w-full flex items-center justify-center bg-background p-6'>
			<form
				onSubmit={handleSubmit}
				className='w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-6 space-y-5'>
				<div className='flex flex-col items-center text-center gap-2'>
					<div className='p-2.5 rounded-lg bg-primary/10 text-primary'>
						<Shield size={24} />
					</div>
					<h1 className='font-serif text-xl font-bold text-foreground'>DM Sign In</h1>
					<p className='text-xs text-muted-foreground'>Enter the editor password to manage campaign data.</p>
				</div>

				<div className='space-y-1'>
					<label htmlFor='dm-password' className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
						Password
					</label>
					<input
						id='dm-password'
						type='password'
						autoFocus
						autoComplete='current-password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
						placeholder='••••••••'
					/>
				</div>

				{error && (
					<div className='flex items-center gap-2 text-xs text-red-600 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2'>
						<AlertCircle size={14} className='shrink-0' />
						{error}
					</div>
				)}

				<Button type='submit' variant='primary' fullWidth disabled={!password || checking}>
					{checking ? (
						<span className='flex items-center justify-center gap-2'>
							<Loader2 size={14} className='animate-spin' /> Verifying…
						</span>
					) : (
						'Sign In'
					)}
				</Button>
			</form>
		</div>
	);
}
