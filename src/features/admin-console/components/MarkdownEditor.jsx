import React, { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';
import { INPUT_CLASS, LABEL_CLASS } from './ui/FormStyles';

export default function MarkdownEditor({ label, value, onChange, placeholder, rows = 6 }) {
	const [mode, setMode] = useState('write'); // 'write' | 'preview'

	return (
		<div>
			<div className='flex items-end justify-between mb-1'>
				<label className={LABEL_CLASS}>{label}</label>
				<div className='flex bg-muted rounded-md p-0.5 border border-border'>
					<button
						type='button'
						onClick={() => setMode('write')}
						className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
							mode === 'write'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						<Edit3 size={12} /> Write
					</button>
					<button
						type='button'
						onClick={() => setMode('preview')}
						className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
							mode === 'preview'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						<Eye size={12} /> Preview
					</button>
				</div>
			</div>

			{mode === 'write' ? (
				<textarea
					rows={rows}
					className={`${INPUT_CLASS} font-mono text-xs leading-relaxed`}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
				/>
			) : (
				<div className='w-full px-3 py-3 bg-muted/10 border border-border rounded-md min-h-[150px] prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2'>
					{value ? (
						<SmartMarkdown>{value}</SmartMarkdown>
					) : (
						<span className='text-muted-foreground italic'>Nothing to preview.</span>
					)}
				</div>
			)}
		</div>
	);
}
