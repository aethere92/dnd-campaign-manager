import React, { useState, useRef } from 'react';
import { Eye, Edit3, Wand2, X } from 'lucide-react';
import SmartMarkdown from '../../smart-text/SmartMarkdown';
import EntitySearch from './EntitySearch';
import { INPUT_CLASS, LABEL_CLASS } from './ui/FormStyles';

export default function MarkdownEditor({ label, value, onChange, placeholder, rows = 6 }) {
	const [mode, setMode] = useState('write');
	const [showSearch, setShowSearch] = useState(false);
	const textareaRef = useRef(null);

	// CHANGED: Handler to detect @ character
	const handleInputChange = (e) => {
		const newValue = e.target.value;
		const selectionStart = e.target.selectionStart;

		// Pass to parent
		onChange(e);

		// Detect if user typed '@'
		const charBefore = newValue.charAt(selectionStart - 1);
		if (charBefore === '@') {
			setShowSearch(true);
		}
	};

	const handleInsertEntity = (entity) => {
		const textarea = textareaRef.current;
		const textToInsert = `[${entity.name}](#entity/${entity.id}/${entity.type})`;

		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const currentText = value || '';

			// CHANGED: Logic to replace the '@' that triggered this if it exists immediately before cursor
			let insertPos = start;
			let beforeText = currentText.substring(0, start);
			const afterText = currentText.substring(end);

			if (beforeText.endsWith('@')) {
				beforeText = beforeText.slice(0, -1);
				insertPos = start - 1;
			}

			const newValue = beforeText + textToInsert + afterText;

			onChange({ target: { value: newValue } });

			setTimeout(() => {
				textarea.focus();
				const newCursorPos = insertPos + textToInsert.length;
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);
		} else {
			const newValue = (value || '') + textToInsert;
			onChange({ target: { value: newValue } });
		}

		setShowSearch(false);
	};

	return (
		<div className='relative'>
			<div className='flex items-end justify-between mb-1'>
				<label className={LABEL_CLASS}>{label}</label>
				<div className='flex bg-muted rounded-md p-0.5 border border-border'>
					{mode === 'write' && (
						<button
							type='button'
							onClick={() => setShowSearch(!showSearch)}
							className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 transition-colors mr-1 ${
								showSearch ? 'bg-amber-100 text-amber-800' : 'text-muted-foreground hover:text-foreground'
							}`}
							title='Insert Entity Embed'>
							<Wand2 size={12} /> Insert
						</button>
					)}

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

			{showSearch && (
				<div className='absolute top-8 left-0 right-0 z-50 p-2 bg-background border border-amber-300 shadow-xl rounded-lg animate-in fade-in zoom-in-95 duration-100'>
					<div className='flex justify-between items-center mb-2 px-1'>
						<span className='text-[10px] font-bold uppercase text-amber-600'>Select Entity</span>
						<button onClick={() => setShowSearch(false)}>
							<X size={14} className='text-gray-400 hover:text-red-500' />
						</button>
					</div>
					<EntitySearch onSelect={handleInsertEntity} />
				</div>
			)}

			{mode === 'write' ? (
				<textarea
					ref={textareaRef}
					rows={rows}
					className={`${INPUT_CLASS} font-mono text-xs leading-relaxed`}
					value={value}
					onChange={handleInputChange} // CHANGED: Use new handler
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
