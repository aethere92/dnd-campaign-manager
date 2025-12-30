import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Standard way to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: '/dnd-campaign-manager/',
	resolve: {
		alias: {
			// This allows you to use @/ to refer to the src folder
			'@': path.resolve(__dirname, './src'),
		},
	},
});
