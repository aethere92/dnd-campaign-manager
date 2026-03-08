import { createClient } from '@supabase/supabase-js';

// 1. Load variables from .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// NEW: Load the DM Password (this will only exist on your local machine)
const DM_PASSWORD = import.meta.env.VITE_DM_PASSWORD;

// 2. Safety Check (Helps debug if .env is missing)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.error(
		'🚨 Supabase Critical Error: Missing environment variables.\n' +
			'Please check that your .env file exists and contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
	);
}

// NEW: Set up custom headers. If the password exists, attach it. If not, send nothing.
const customHeaders = DM_PASSWORD ? { 'x-dm-password': DM_PASSWORD } : {};

// 3. Initialize and Export the Client (now with the custom headers attached)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	global: {
		headers: customHeaders
	}
});