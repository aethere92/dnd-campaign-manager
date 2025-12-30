import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/app/App';
import '@/app/styles/global.css';
import 'leaflet/dist/leaflet.css';

const validateEnv = () => {
	const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
	const missing = required.filter((key) => !import.meta.env[key]);
	if (missing.length > 0) {
		console.error('Missing required environment variables:', missing);
	}
};
validateEnv();

// CHANGED: Aggressive Caching Configuration
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Data is considered fresh for 1 hour
			staleTime: 1000 * 60 * 60,
			// Keep unused data in memory for 24 hours
			cacheTime: 1000 * 60 * 60 * 24,
			refetchOnWindowFocus: false,
			refetchOnMount: false, // Don't refetch just because component remounted
			retry: 1,
		},
	},
});

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<HashRouter>
				<App />
			</HashRouter>
		</QueryClientProvider>
	</React.StrictMode>
);
