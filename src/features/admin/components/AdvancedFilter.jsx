import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Filter, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { OPERATORS, extractAvailableFields } from '@/features/admin/utils/filterUtils';

export default function AdvancedFilter({ type, data, onFilterChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [rules, setRules] = useState([]);
	const containerRef = useRef(null);

	// Calculate available fields based on the actual data passed in
	const availableFields = useMemo(() => extractAvailableFields(type, data), [type, data]);

	// Notify parent whenever rules change
	useEffect(() => {
		onFilterChange(rules);
	}, [rules]);

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const addRule = () => {
		setRules([
			...rules,
			{
				id: Date.now(),
				field: 'name',
				operator: 'contains',
				value: '',
			},
		]);
	};

	const updateRule = (id, field, val) => {
		setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
	};

	const removeRule = (id) => {
		setRules((prev) => prev.filter((r) => r.id !== id));
	};

	const clearAll = () => setRules([]);

	const activeCount = rules.length;

	return (
		<div className='relative' ref={containerRef}>
			{/* TRIGGER BUTTON */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`h-full aspect-square flex items-center justify-center rounded-md border transition-all relative ${
					activeCount > 0
						? 'bg-amber-500 text-white border-amber-600 shadow-sm'
						: 'bg-background border-border text-muted-foreground hover:bg-muted'
				}`}
				title='Advanced Filters'>
				<Filter size={14} strokeWidth={activeCount > 0 ? 2.5 : 2} />
				{activeCount > 0 && (
					<span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-background shadow-sm'>
						{activeCount}
					</span>
				)}
			</button>

			{/* DROPDOWN PANEL */}
			{isOpen && (
				<div className='absolute right-0 top-full mt-2 w-[290px] bg-popover border border-border rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[60vh] ring-1 ring-black/5'>
					{/* HEADER */}
					<div className='p-3 border-b border-border bg-muted/30 flex justify-between items-center shrink-0'>
						<span className='text-[10px] font-bold uppercase text-muted-foreground tracking-wider'>
							Filter Conditions
						</span>
						{activeCount > 0 && (
							<button
								onClick={clearAll}
								className='text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1 font-medium px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors'>
								<Trash2 size={10} /> Clear All
							</button>
						)}
					</div>

					{/* RULES LIST */}
					<div className='p-2 space-y-2 overflow-y-auto min-h-[100px] custom-scrollbar'>
						{rules.length === 0 ? (
							<div className='flex flex-col items-center justify-center py-6 text-muted-foreground opacity-60'>
								<Filter size={24} className='mb-2 opacity-50' />
								<span className='text-xs italic'>No filters applied.</span>
							</div>
						) : (
							rules.map((rule) => {
								const opDef = OPERATORS.find((o) => o.value === rule.operator);
								const needsValue = opDef?.needsValue ?? true;

								return (
									<div
										key={rule.id}
										className='flex flex-col gap-2 p-2 bg-muted/40 border border-border/60 rounded-md group hover:border-border hover:bg-muted/60 transition-colors shadow-sm'>
										<div className='flex gap-2 items-center'>
											{/* Field Select */}
											<select
												className='flex-1 h-7 text-[11px] rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary outline-none shadow-sm cursor-pointer font-medium'
												value={rule.field}
												onChange={(e) => updateRule(rule.id, 'field', e.target.value)}>
												{availableFields.map((f) => (
													<option key={f.value} value={f.value}>
														{f.label}
													</option>
												))}
											</select>

											{/* Remove Button */}
											<button
												onClick={() => removeRule(rule.id)}
												className='text-muted-foreground/50 hover:text-red-500 p-1 rounded-sm hover:bg-red-500/10 transition-colors'
												title='Remove Condition'>
												<X size={14} />
											</button>
										</div>

										<div className='flex gap-2'>
											{/* Operator Select */}
											<select
												className={`h-7 text-[11px] rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary outline-none shadow-sm cursor-pointer ${
													needsValue ? 'w-1/3' : 'w-full'
												}`}
												value={rule.operator}
												onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}>
												{OPERATORS.map((op) => (
													<option key={op.value} value={op.value}>
														{op.label}
													</option>
												))}
											</select>

											{/* Value Input (Conditional) */}
											{needsValue && (
												<input
													type='text'
													className='flex-1 h-7 text-[11px] rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary outline-none shadow-sm'
													placeholder='Value...'
													value={rule.value}
													onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
												/>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>

					{/* FOOTER */}
					<div className='p-2 border-t border-border bg-muted/10 shrink-0'>
						<Button
							onClick={addRule}
							variant='secondary'
							size='sm'
							fullWidth
							icon={Plus}
							className='h-8 text-xs font-medium'>
							Add Filter Condition
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
