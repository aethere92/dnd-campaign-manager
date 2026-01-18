import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ADMIN_INPUT_CLASS } from '../AdminFormStyles';

// --- 1. AUTO-EXPANDING STRING INPUT ---
// Looks like an input for short text, grows like a textarea for long text
const AutoStringInput = ({ value, onChange, placeholder }) => {
	const textareaRef = useRef(null);

	// Auto-resize logic
	const adjustHeight = () => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = 'auto'; // Reset to calculate shrink
			el.style.height = el.scrollHeight + 2 + 'px'; // Set to scroll height
		}
	};

	// Adjust on mount and value change
	useLayoutEffect(() => {
		adjustHeight();
	}, [value]);

	return (
		<textarea
			ref={textareaRef}
			rows={1}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			// min-h-[38px] matches the standard input height of the other fields
			className={`${ADMIN_INPUT_CLASS} min-h-[38px] resize-none overflow-hidden leading-relaxed`}
			style={{ height: '38px' }}
		/>
	);
};

// --- 2. TOGGLE ---
const BooleanInput = ({ value, onChange }) => {
	const isChecked = String(value) === 'true';
	return (
		<div className='flex items-center h-[38px] select-none'>
			<button
				type='button'
				onClick={() => onChange(!isChecked)}
				className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${isChecked ? 'bg-emerald-500' : 'bg-muted-foreground/30'}
                `}
				role='switch'
				aria-checked={isChecked}>
				<span
					aria-hidden='true'
					className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${isChecked ? 'translate-x-5' : 'translate-x-0'}
                    `}
				/>
			</button>
			<span
				onClick={() => onChange(!isChecked)}
				className='ml-3 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground'>
				{isChecked ? 'True' : 'False'}
			</span>
		</div>
	);
};

// --- 3. EDITABLE TAG HELPER ---
const EditableTag = ({ text, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(text);
	const inputRef = useRef(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleSave = () => {
		if (editValue.trim()) {
			onUpdate(editValue.trim());
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') handleSave();
		if (e.key === 'Escape') {
			setEditValue(text);
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				type='text'
				value={editValue}
				onChange={(e) => setEditValue(e.target.value)}
				onBlur={handleSave}
				onKeyDown={handleKeyDown}
				className='h-6 min-w-[60px] max-w-[150px] px-1 text-xs bg-background border border-primary rounded outline-none shadow-sm'
			/>
		);
	}

	return (
		<span
			className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors group'
			onClick={() => setIsEditing(true)}
			title='Click to edit'>
			{text}
			<button
				type='button'
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className='ml-1 text-primary/60 hover:text-red-500 transition-colors focus:outline-none'>
				<X size={12} strokeWidth={3} />
			</button>
		</span>
	);
};

// --- 4. LIST INPUT ---
const ListInput = ({ value, onChange }) => {
	const [items, setItems] = useState(() => {
		try {
			if (Array.isArray(value)) return value;
			return JSON.parse(value || '[]');
		} catch {
			return [];
		}
	});
	const [draft, setDraft] = useState('');

	useEffect(() => {
		onChange(JSON.stringify(items));
	}, [items]);

	const addItem = () => {
		if (!draft.trim()) return;
		setItems([...items, draft.trim()]);
		setDraft('');
	};

	const updateItem = (index, newVal) => {
		const newItems = [...items];
		newItems[index] = newVal;
		setItems(newItems);
	};

	const deleteItem = (index) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addItem();
		}
		if (e.key === 'Backspace' && draft === '' && items.length > 0) {
			deleteItem(items.length - 1);
		}
	};

	return (
		<div className='min-h-[38px] w-full bg-background border border-border rounded-md px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all flex flex-wrap gap-2 items-center'>
			{items.map((item, idx) => (
				<EditableTag
					key={`${idx}-${item}`}
					text={item}
					onUpdate={(val) => updateItem(idx, val)}
					onDelete={() => deleteItem(idx)}
				/>
			))}

			<div className='flex-1 min-w-[120px]'>
				<input
					type='text'
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={addItem}
					placeholder={items.length === 0 ? 'Type items... (Press Enter)' : 'Add another...'}
					className='w-full h-6 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50'
				/>
			</div>
		</div>
	);
};

// --- 5. MAP INPUT ---
const MapInput = ({ value, onChange }) => {
	const [rows, setRows] = useState(() => {
		try {
			const obj = typeof value === 'string' ? JSON.parse(value) : value;
			if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
			return Object.entries(obj).map(([k, v]) => ({
				id: Math.random(),
				key: k,
				val: v,
			}));
		} catch {
			return [];
		}
	});

	useEffect(() => {
		const newObj = {};
		rows.forEach((r) => {
			if (r.key.trim()) {
				const isNum = !isNaN(r.val) && r.val !== '' && String(r.val).trim() !== '';
				newObj[r.key] = isNum ? Number(r.val) : r.val;
			}
		});
		onChange(JSON.stringify(newObj));
	}, [rows]);

	const updateRow = (index, field, newVal) => {
		const newRows = [...rows];
		newRows[index][field] = newVal;
		setRows(newRows);
	};

	const addRow = () => setRows([...rows, { id: Math.random(), key: '', val: '' }]);
	const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

	return (
		<div className='space-y-2 border border-border rounded-md p-3 bg-muted/20'>
			{rows.map((row, idx) => (
				<div key={row.id} className='flex gap-2 items-center'>
					<input
						type='text'
						placeholder='Key'
						value={row.key}
						onChange={(e) => updateRow(idx, 'key', e.target.value)}
						className={`${ADMIN_INPUT_CLASS} font-bold w-1/3`}
					/>
					<span className='text-muted-foreground font-bold'>:</span>
					<input
						type='text'
						placeholder='Value'
						value={row.val}
						onChange={(e) => updateRow(idx, 'val', e.target.value)}
						className={`${ADMIN_INPUT_CLASS} flex-1`}
					/>
					<button
						type='button'
						onClick={() => removeRow(idx)}
						className='text-muted-foreground hover:text-red-500 p-2'
						tabIndex={-1}>
						<X size={16} />
					</button>
				</div>
			))}
			<button
				type='button'
				onClick={addRow}
				className='flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded transition-colors'>
				<Plus size={14} /> Add Property
			</button>
		</div>
	);
};

// --- MAIN EXPORT ---
export default function AttributeValueInput({ type, value, onChange, placeholder, ...props }) {
	if (type === 'boolean') return <BooleanInput value={value} onChange={onChange} />;
	if (type === 'list') return <ListInput value={value} onChange={onChange} />;
	if (type === 'map') return <MapInput value={value} onChange={onChange} />;

	if (type === 'number') {
		return (
			<input
				type='number'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={ADMIN_INPUT_CLASS}
				placeholder={placeholder}
				{...props}
			/>
		);
	}

	if (type === 'json') {
		return (
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`${ADMIN_INPUT_CLASS} font-mono text-xs min-h-[60px] leading-relaxed resize-y`}
				placeholder={placeholder}
				{...props}
			/>
		);
	}

	// Default: Auto-Expanding String
	return <AutoStringInput value={value} onChange={onChange} placeholder={placeholder} />;
}
