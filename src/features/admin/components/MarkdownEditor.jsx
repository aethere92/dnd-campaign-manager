import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit3, Wand2, X, AtSign } from 'lucide-react';
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';
import EntitySearch from './EntitySearch';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminFormStyles';

export default function MarkdownEditor({ label, value, onChange, placeholder, rows = 8 }) {
	const [mode, setMode] = useState('write');
	const [showSearch, setShowSearch] = useState(false);
	const textareaRef = useRef(null);

	const handleInputChange = (e) => {
		const newValue = e.target.value;
		const selectionStart = e.target.selectionStart;
		onChange(e);

		// Detect '@' trigger
		const charBefore = newValue.charAt(selectionStart - 1);
		if (charBefore === '@') {
			setShowSearch(true);
		}
	};

	const handleInsertEntity = (entity) => {
		const textarea = textareaRef.current;
		const textToInsert = `[:: ${entity.name} ::](#entity/${entity.id}/${entity.type})`;

		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const currentText = value || '';

			let insertPos = start;
			let beforeText = currentText.substring(0, start);
			const afterText = currentText.substring(end);

			if (beforeText.endsWith('@')) {
				beforeText = beforeText.slice(0, -1);
				insertPos = start - 1;
			}

			const newValue = beforeText + textToInsert + afterText;
			onChange({ target: { value: newValue } });

			// Return focus and fix cursor position
			setTimeout(() => {
				textarea.focus();
				const newCursorPos = insertPos + textToInsert.length;
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);
		}
		setShowSearch(false);
	};

	return (
		<div className='relative flex flex-col'>
			<div className='flex items-end justify-between mb-1.5'>
				<label className={ADMIN_LABEL_CLASS}>{label}</label>
				<div className='flex bg-muted/50 rounded-md p-0.5 border border-border shadow-sm'>
					<button
						type='button'
						onClick={() => setShowSearch(!showSearch)}
						className={`px-2 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-all ${
							showSearch
								? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						<AtSign size={12} /> Mentions
					</button>
					<div className='w-px bg-border mx-1 my-1' />
					<button
						type='button'
						onClick={() => setMode('write')}
						className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-all ${
							mode === 'write'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						Write
					</button>
					<button
						type='button'
						onClick={() => setMode('preview')}
						className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-all ${
							mode === 'preview'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}>
						Preview
					</button>
				</div>
			</div>

			<div className='relative'>
				{/* FLOATING MENTION MODAL - Now Absolute and Z-Indexed to prevent layout push */}
				{showSearch && (
					<div className='absolute inset-x-0 top-0 z-50 p-3 bg-background border border-amber-300 shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-150'>
						<div className='flex justify-between items-center mb-2'>
							<span className='text-[10px] font-bold uppercase text-amber-600 tracking-widest flex items-center gap-1'>
								<Wand2 size={10} /> Link Entity
							</span>
							<button onClick={() => setShowSearch(false)} className='text-muted-foreground hover:text-red-500'>
								<X size={14} />
							</button>
						</div>
						<EntitySearch onSelect={handleInsertEntity} autoFocus />
					</div>
				)}

				{mode === 'write' ? (
					<textarea
						ref={textareaRef}
						rows={rows}
						className={`${ADMIN_INPUT_CLASS} font-mono text-xs leading-relaxed min-h-[150px] resize-y`}
						value={value}
						onChange={handleInputChange}
						placeholder={placeholder}
					/>
				) : (
					<div className='w-full px-4 py-3 bg-muted/10 border border-border rounded-md min-h-[150px] prose prose-sm max-w-none'>
						{value ? (
							<SmartMarkdown>{value}</SmartMarkdown>
						) : (
							<span className='text-muted-foreground italic text-xs'>Nothing to preview.</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
