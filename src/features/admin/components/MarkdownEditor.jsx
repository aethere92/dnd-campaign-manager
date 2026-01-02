// features/admin/components/MarkdownEditor.jsx
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ADMIN_LABEL_CLASS } from './AdminFormStyles';

const HeavyEditor = React.lazy(() => import('./MarkdownEditorImpl'));

export default function MarkdownEditor(props) {
	return (
		<Suspense fallback={<LoadingFallback label={props.label} />}>
			<HeavyEditor {...props} />
		</Suspense>
	);
}

function LoadingFallback({ label }) {
	return (
		<div className='flex flex-col gap-1.5'>
			{label && <label className={ADMIN_LABEL_CLASS}>{label}</label>}
			<div className='h-[230px] w-full border border-border rounded-lg bg-muted/10 flex items-center justify-center text-muted-foreground gap-2 animate-pulse'>
				<Loader2 size={20} className='animate-spin' />
				<span className='text-xs'>Loading Editor...</span>
			</div>
		</div>
	);
}
