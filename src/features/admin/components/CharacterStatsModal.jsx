import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Zap } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { ADMIN_INPUT_CLASS, ADMIN_LABEL_CLASS } from './AdminFormStyles';

const STANDARD_SKILLS = [
	'Acrobatics',
	'Animal Handling',
	'Arcana',
	'Athletics',
	'Deception',
	'History',
	'Insight',
	'Intimidation',
	'Investigation',
	'Medicine',
	'Nature',
	'Perception',
	'Performance',
	'Persuasion',
	'Religion',
	'Sleight of Hand',
	'Stealth',
	'Survival',
];

const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

// Special senses with range values (D&D Beyond order)
const SPECIAL_SENSES = ['Blindsight', 'Darkvision', 'Tremorsense', 'Truesight'];

// Passive senses always present, each stored as "Passive X <score>"
const PASSIVE_SENSES = ['Passive Perception', 'Passive Investigation', 'Passive Insight'];

const STANDARD_LANGUAGES = [
	'Common',
	'Dwarvish',
	'Elvish',
	'Giant',
	'Gnomish',
	'Goblin',
	'Halfling',
	'Orc',
	'Abyssal',
	'Celestial',
	'Draconic',
	'Deep Speech',
	'Infernal',
	'Primordial',
	'Sylvan',
	'Undercommon',
];

// Parse a stored attribute value (JSON string or array) into an array
function parseList(value) {
	if (Array.isArray(value)) return value;
	try {
		const parsed = JSON.parse(value || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

// Extract the modifier from a stored entry like "Acrobatics (+1)" or "STR +7"
function extractModifier(entry, name) {
	if (!entry || !entry.toLowerCase().startsWith(name.toLowerCase())) return null;
	const match = entry.match(/\(?([+-]?\d+)\)?\s*$/);
	return match ? parseInt(match[1], 10) : null;
}

// Extract the raw score from "STR 18 (+4)"
function extractScore(entry, ability) {
	if (!entry || !entry.toLowerCase().startsWith(ability.toLowerCase())) return null;
	const match = entry.match(/(\d+)/);
	return match ? parseInt(match[1], 10) : null;
}

function formatModifier(n) {
	return n >= 0 ? `+${n}` : `${n}`;
}

// D&D 5e: modifier = floor((score - 10) / 2)
function scoreToModifier(score) {
	if (score === null || score === undefined || Number.isNaN(score)) return null;
	return Math.floor((score - 10) / 2);
}

// --- Scrollable number input: scroll wheel / arrow keys to step ---
function ScrollNumberInput({ value, onChange, min = -10, max = 30, step = 1, className = '' }) {
	const clamp = (n) => Math.min(max, Math.max(min, n));
	const increment = (delta) => {
		const base = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
		onChange(clamp(base + delta * step));
	};

	return (
		<div
			className={`relative ${className}`}
			onWheel={(e) => {
				e.preventDefault();
				increment(e.deltaY < 0 ? 1 : -1);
			}}>
			<input
				type='number'
				value={value ?? ''}
				onChange={(e) => {
					const n = parseInt(e.target.value, 10);
					onChange(Number.isNaN(n) ? null : n);
				}}
				onKeyDown={(e) => {
					if (e.key === 'ArrowUp') {
						e.preventDefault();
						increment(1);
					}
					if (e.key === 'ArrowDown') {
						e.preventDefault();
						increment(-1);
					}
				}}
				className={`${ADMIN_INPUT_CLASS} text-center appearance-none`}
			/>
		</div>
	);
}

// --- Grid of all abilities/skills with per-entry modifier inputs ---
// mode: 'skill' -> "Name (+X)", 'save' -> "NAME +X", 'score' -> "NAME S (+M)"
function StatGrid({ names, values, onChange, mode }) {
	const getEntry = (name) => values.find((v) => v && v.toLowerCase().startsWith(name.toLowerCase()));

	const getModifier = (name) => {
		const entry = getEntry(name);
		if (!entry) return null;
		if (mode === 'score') return scoreToModifier(extractScore(entry, name));
		return extractModifier(entry, name);
	};

	const getScore = (name) => {
		const entry = getEntry(name);
		return entry ? extractScore(entry, name) : null;
	};

	// Rebuild the values array in canonical `names` order, replacing the entry
	// for `name` with `newEntry` (or dropping it if null). This keeps the stored
	// list ordered (e.g. STR, DEX, CON...) no matter which field was edited last.
	const updateEntry = (name, newEntry) => {
		onChange(names.map((n) => (n.toLowerCase() === name.toLowerCase() ? newEntry : getEntry(n))).filter(Boolean));
	};

	const setModifier = (name, mod) => {
		let entry;
		if (mod === null || (typeof mod === 'number' && Number.isNaN(mod))) {
			entry = null;
		} else if (mode === 'skill') {
			entry = `${name} (${formatModifier(mod)})`;
		} else if (mode === 'save') {
			entry = `${name} ${formatModifier(mod)}`;
		} else {
			const score = getScore(name) ?? mod * 2 + 10;
			entry = `${name} ${score} (${formatModifier(scoreToModifier(score))})`;
		}
		updateEntry(name, entry);
	};

	const setScore = (name, score) => {
		if (score === null || Number.isNaN(score)) {
			updateEntry(name, null);
			return;
		}
		updateEntry(name, `${name} ${score} (${formatModifier(scoreToModifier(score))})`);
	};

	return (
		<div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
			{names.map((name) => (
				<div key={name} className='flex items-center gap-2 bg-muted/20 border border-border rounded-md px-2 py-1.5'>
					<span className='text-xs font-bold text-muted-foreground flex-1 truncate' title={name}>
						{name}
					</span>
					{mode === 'score' ? (
						<>
							<ScrollNumberInput
								className='w-16'
								value={getScore(name)}
								onChange={(n) => setScore(name, n)}
								min={1}
								max={30}
							/>
							<span className='text-[10px] font-mono text-primary w-8 text-right'>
								{(() => {
									const m = scoreToModifier(getScore(name));
									return m === null ? '' : formatModifier(m);
								})()}
							</span>
						</>
					) : (
						<ScrollNumberInput
							className='w-16'
							value={getModifier(name)}
							onChange={(n) => setModifier(name, n)}
							min={-5}
							max={15}
						/>
					)}
				</div>
			))}
		</div>
	);
}

// --- Tag list editor with standard-entry suggestions ---
function TagListEditor({ items, onChange, suggestions }) {
	const [draft, setDraft] = useState('');
	const inputRef = useRef(null);

	const add = (val) => {
		const trimmed = val.trim();
		if (!trimmed || items.includes(trimmed)) return;
		onChange([...items, trimmed]);
		setDraft('');
		inputRef.current?.focus();
	};

	const available = useMemo(() => {
		if (!suggestions) return [];
		return suggestions.filter(
			(s) => !items.some((i) => i.toLowerCase() === s.toLowerCase()) && !draft.toLowerCase().startsWith(s.toLowerCase())
		);
	}, [suggestions, items, draft]);

	return (
		<div>
			<div className='min-h-[38px] w-full bg-background border border-border rounded-md px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all flex flex-wrap gap-2 items-center'>
				{items.map((item, idx) => (
					<span
						key={`${idx}-${item}`}
						className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20'>
						{item}
						<button
							type='button'
							onClick={() => onChange(items.filter((_, i) => i !== idx))}
							className='text-primary/60 hover:text-red-500 transition-colors'>
							<X size={12} strokeWidth={3} />
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					type='text'
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							add(draft);
						}
						if (e.key === 'Backspace' && draft === '' && items.length > 0) {
							onChange(items.slice(0, -1));
						}
					}}
					placeholder={items.length === 0 ? 'Type or click a suggestion... (Enter to add)' : 'Add another...'}
					className='flex-1 min-w-[120px] h-6 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50'
				/>
			</div>
			{suggestions && available.length > 0 && (
				<div className='flex flex-wrap gap-1 mt-1.5'>
					{available.map((s) => (
						<button
							key={s}
							type='button'
							onClick={() => add(s)}
							className='px-1.5 py-0.5 text-[10px] font-medium rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/50 bg-muted/40 transition-colors'>
							+ {s}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default function CharacterStatsModal({ open, onClose, initialAttributes = {}, onApply }) {
	const [initiative, setInitiative] = useState(null);
	const [proficiency, setProficiency] = useState(null);
	const [skills, setSkills] = useState([]);
	const [savingThrows, setSavingThrows] = useState([]);
	const [abilityScores, setAbilityScores] = useState([]);
	const [languages, setLanguages] = useState([]);
	const [passiveSenses, setPassiveSenses] = useState({});
	const [specialSenses, setSpecialSenses] = useState({});

	// Pre-fill from existing custom attributes each time the modal opens.
	// Skills/saves default to +0 so every entry is always present.
	useEffect(() => {
		if (!open) return;

		const initMatch = String(initialAttributes.initiative ?? '').match(/[+-]?\d+/);
		setInitiative(initMatch ? parseInt(initMatch[0], 10) : 0);
		const profMatch = String(initialAttributes.proficiency ?? '').match(/[+-]?\d+/);
		setProficiency(profMatch ? parseInt(profMatch[0], 10) : 2);

		const storedSkills = parseList(initialAttributes.skills);
		setSkills(
			STANDARD_SKILLS.map((name) => {
				const stored = storedSkills.find((s) => s && s.toLowerCase().startsWith(name.toLowerCase()));
				return `${name} (${formatModifier(stored ? (extractModifier(stored, name) ?? 0) : 0)})`;
			})
		);

		const storedSaves = parseList(initialAttributes['saving throw']);
		setSavingThrows(
			ABILITIES.map((ab) => {
				const stored = storedSaves.find((s) => s && s.toLowerCase().startsWith(ab.toLowerCase()));
				return `${ab} ${formatModifier(stored ? (extractModifier(stored, ab) ?? 0) : 0)}`;
			})
		);

		const storedScores = parseList(initialAttributes['ability score']);
		setAbilityScores(
			ABILITIES.map((ab) => {
				const stored = storedScores.find((s) => s && s.toLowerCase().startsWith(ab.toLowerCase()));
				const score = stored ? (extractScore(stored, ab) ?? 10) : 10;
				return `${ab} ${score} (${formatModifier(scoreToModifier(score))})`;
			})
		);

		setLanguages(parseList(initialAttributes.languages));

		// Senses: parse "Passive Perception 12" and "Darkvision 60 ft."
		const storedSenses = parseList(initialAttributes['additional senses']);
		const nextPassive = {};
		PASSIVE_SENSES.forEach((name) => {
			const stored = storedSenses.find((s) => s && s.toLowerCase().startsWith(name.toLowerCase()));
			const match = stored ? stored.match(/(\d+)\s*$/) : null;
			nextPassive[name] = match ? parseInt(match[1], 10) : null;
		});
		setPassiveSenses(nextPassive);

		const nextSpecial = {};
		SPECIAL_SENSES.forEach((name) => {
			const stored = storedSenses.find((s) => s && s.toLowerCase().startsWith(name.toLowerCase()));
			if (!stored) {
				nextSpecial[name] = { enabled: false, range: '' };
			} else {
				const match = stored.match(/(\d+(?:\s*(?:ft\.?|feet))?)\s*$/i);
				nextSpecial[name] = { enabled: true, range: match ? match[1] : '' };
			}
		});
		setSpecialSenses(nextSpecial);
	}, [open, initialAttributes]);

	if (!open) return null;

	const handleApply = () => {
		// Build "additional senses" in D&D Beyond order: passives first, then special senses
		const senses = [];
		PASSIVE_SENSES.forEach((name) => {
			if (passiveSenses[name] !== null && passiveSenses[name] !== undefined && !Number.isNaN(passiveSenses[name])) {
				senses.push(`${name} ${passiveSenses[name]}`);
			}
		});
		SPECIAL_SENSES.forEach((name) => {
			const s = specialSenses[name];
			if (s?.enabled) {
				senses.push(s.range ? `${name} ${s.range}` : name);
			}
		});

		onApply({
			initiative: formatModifier(initiative ?? 0),
			proficiency: formatModifier(proficiency ?? 0),
			skills,
			'saving throw': savingThrows,
			'ability score': abilityScores,
			languages,
			'additional senses': senses,
		});
		onClose();
	};

	return (
		<div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
			<div className='relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200'>
				{/* Header */}
				<div className='flex items-center justify-between px-5 py-4 border-b border-border shrink-0'>
					<div className='flex items-center gap-2'>
						<Zap size={18} className='text-primary' />
						<h3 className='font-serif font-bold text-base'>Quick Fill Character Stats</h3>
					</div>
					<button
						type='button'
						onClick={onClose}
						className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors'>
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className='overflow-y-auto custom-scrollbar px-5 py-4 space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className={ADMIN_LABEL_CLASS}>Initiative</label>
							<ScrollNumberInput value={initiative} onChange={setInitiative} min={-10} max={20} />
						</div>
						<div>
							<label className={ADMIN_LABEL_CLASS}>Proficiency Bonus</label>
							<ScrollNumberInput value={proficiency} onChange={setProficiency} min={0} max={10} />
						</div>
					</div>

					<div>
						<label className={ADMIN_LABEL_CLASS}>Ability Scores</label>
						<StatGrid names={ABILITIES} values={abilityScores} onChange={setAbilityScores} mode='score' />
					</div>

					<div>
						<label className={ADMIN_LABEL_CLASS}>Saving Throws</label>
						<StatGrid names={ABILITIES} values={savingThrows} onChange={setSavingThrows} mode='save' />
					</div>

					<div>
						<label className={ADMIN_LABEL_CLASS}>Skills</label>
						<StatGrid names={STANDARD_SKILLS} values={skills} onChange={setSkills} mode='skill' />
					</div>

					<div>
						<label className={ADMIN_LABEL_CLASS}>Languages</label>
						<TagListEditor items={languages} onChange={setLanguages} suggestions={STANDARD_LANGUAGES} />
					</div>

					<div>
						<label className={ADMIN_LABEL_CLASS}>Additional Senses</label>
						<div className='space-y-2'>
							<div className='grid grid-cols-3 gap-2'>
								{PASSIVE_SENSES.map((name) => (
									<div
										key={name}
										className='flex items-center gap-2 bg-muted/20 border border-border rounded-md px-2 py-1.5'>
										<span className='text-xs font-bold text-muted-foreground flex-1 truncate' title={name}>
											{name}
										</span>
										<ScrollNumberInput
											className='w-16'
											value={passiveSenses[name]}
											onChange={(n) => setPassiveSenses((p) => ({ ...p, [name]: n }))}
											min={0}
											max={40}
										/>
									</div>
								))}
							</div>
							<div className='grid grid-cols-2 gap-2'>
								{SPECIAL_SENSES.map((name) => {
									const s = specialSenses[name] || { enabled: false, range: '' };
									return (
										<div
											key={name}
											className='flex items-center gap-2 bg-muted/20 border border-border rounded-md px-2 py-1.5'>
											<button
												type='button'
												onClick={() => setSpecialSenses((p) => ({ ...p, [name]: { ...s, enabled: !s.enabled } }))}
												className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
													s.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'
												}`}
												role='switch'
												aria-checked={s.enabled}>
												<span
													aria-hidden='true'
													className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
														s.enabled ? 'translate-x-4' : 'translate-x-0'
													}`}
												/>
											</button>
											<span
												className={`text-xs font-bold flex-1 truncate ${s.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
												{name}
											</span>
											{s.enabled && (
												<input
													type='text'
													value={s.range}
													onChange={(e) => setSpecialSenses((p) => ({ ...p, [name]: { ...s, range: e.target.value } }))}
													placeholder='60 ft.'
													className='w-20 px-2 py-1 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
												/>
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='flex justify-end gap-2 px-5 py-4 border-t border-border shrink-0'>
					<Button type='button' variant='ghost' size='sm' onClick={onClose}>
						Cancel
					</Button>
					<Button type='button' variant='primary' size='sm' icon={Zap} onClick={handleApply}>
						Apply to Form
					</Button>
				</div>
			</div>
		</div>
	);
}
