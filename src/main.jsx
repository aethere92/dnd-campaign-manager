import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './features/app-core/App'; // Importing the Core Feature
import './index.css';
import 'leaflet/dist/leaflet.css'; // Leaflet Styles

// 1. Environment Validation
const validateEnv = () => {
	const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
	const missing = required.filter((key) => !import.meta.env[key]);

	if (missing.length > 0) {
		console.error('Missing required environment variables:', missing);
	}
};
validateEnv();

// 2. Query Client Configuration
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			cacheTime: 1000 * 60 * 30, // 30 minutes
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

// 3. Mount
ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<HashRouter>
				<App />
			</HashRouter>
		</QueryClientProvider>
	</React.StrictMode>
);
