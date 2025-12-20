import { createClient } from '@supabase/supabase-js';

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

// 3. Initialize and Export the Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
