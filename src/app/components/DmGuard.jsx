import { Navigate, Outlet } from 'react-router-dom';
import { isDmAuthenticated } from '@/shared/api/dmSession';
import { routes } from '@/app/routes';

/**
 * Gate for the /dm console. UX-only: it decides whether to *show* the editor, not
 * whether writes are allowed — the database enforces that via check_dm_password()
 * regardless of what renders. Without a password in the session, send the DM to
 * the login screen.
 *
 * Read at render time (not cached in state) so a logout elsewhere takes effect on
 * the next navigation.
 */
export const DmGuard = () => {
	if (!isDmAuthenticated()) {
		return <Navigate to={routes.admin.login()} replace />;
	}
	return <Outlet />;
};
