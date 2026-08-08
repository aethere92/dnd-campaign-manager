/**
 * DM (editor) session secret.
 *
 * The one place that knows where the DM password lives at runtime. It is NEVER
 * bundled — there is no build-time copy anymore. The DM types it into the login
 * screen; it is held in sessionStorage (this browser tab, this session only) and
 * forwarded as the `x-dm-password` header on every Supabase request (see
 * supabaseClient.js). The authoritative copy lives solely in the database function
 * check_dm_password(); this is just the value the client presents to it.
 *
 * sessionStorage, not localStorage: the grant should not outlive the tab, and
 * should not silently follow the DM around forever. Cleared on logout.
 */
const DM_PASSWORD_KEY = 'dmPassword';

export const getDmPassword = () => {
	try {
		return sessionStorage.getItem(DM_PASSWORD_KEY) || null;
	} catch {
		// Private-mode / storage-disabled: behave as "not signed in".
		return null;
	}
};

export const setDmPassword = (password) => {
	try {
		if (password) sessionStorage.setItem(DM_PASSWORD_KEY, password);
	} catch {
		// If storage is unavailable the DM simply can't stay signed in; the write
		// paths will fail loudly rather than silently, which is acceptable.
	}
};

export const clearDmPassword = () => {
	try {
		sessionStorage.removeItem(DM_PASSWORD_KEY);
	} catch {
		/* nothing to clear */
	}
};

/** UX gate only — the database is the real gate. True if a password is present. */
export const isDmAuthenticated = () => !!getDmPassword();
