import { createClient } from '@supabase/supabase-js';
import { getDmPassword } from '@/shared/api/dmSession';

// 1. Load variables from .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Safety Check (Helps debug if .env is missing)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.error(
		'🚨 Supabase Critical Error: Missing environment variables.\n' +
			'Please check that your .env file exists and contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
	);
}

/**
 * Attach the DM password header per-request, read fresh from the session each time.
 *
 * The password used to be baked into the client's headers at creation from a
 * build-time env var — which meant it shipped in the public bundle, and the header
 * was fixed for the client's whole life. Now there is no build-time copy: the DM
 * signs in at runtime (see DmLogin), the value lives in sessionStorage, and this
 * wrapper reads it on every call. Requests made before sign-in simply carry no
 * DM header, so RLS treats them as read-only — exactly what we want for visitors.
 */
const dmFetch = (input, init = {}) => {
	const password = getDmPassword();
	if (!password) return fetch(input, init);

	const headers = new Headers(init.headers || {});
	headers.set('x-dm-password', password);
	return fetch(input, { ...init, headers });
};

// 3. Initialize and export the client with the DM-aware fetch.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	global: {
		fetch: dmFetch,
	},
});
