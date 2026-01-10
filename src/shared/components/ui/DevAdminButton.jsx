import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Wrench } from 'lucide-react';

export default function DevAdminButton() {
	// CRITICAL: This ensures it never renders in Production (GitHub Pages)
	if (!import.meta.env.DEV) return null;

	return (
		<Link
			to='/dm'
			className='fixed bottom-6 left-6 lg:left-[unset] lg:right-6 z-[999] flex items-center gap-2 px-4 py-1 bg-muted  rounded-full shadow-xl hover:bg-background hover:scale-105 transition-all border border-stone-300'
			title='Open DM Console (Dev Mode Only)'>
			<Wrench size={14} />
			<span className='hidden md:inline'>Dev</span>
		</Link>
	);
}
