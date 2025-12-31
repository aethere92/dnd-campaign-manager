import { ENTITY_TYPES } from './entityTypes';

/**
 * Tailwind class maps
 * CHANGED: Replaced 'slate' with 'muted-foreground' or 'foreground' to respect the active theme.
 */
const ENTITY_TAILWIND_CLASSES = {
	[ENTITY_TYPES.SESSION]: {
		text: 'text-[var(--entity-session,theme(colors.slate.500))] font-medium',
		bg: 'bg-muted/50',
		border: 'border-border',
		hover: 'hover:bg-muted',
	},
	[ENTITY_TYPES.CHARACTER]: {
		text: 'text-[var(--entity-character,theme(colors.red.500))]',
		bg: 'bg-red-500/10',
		border: 'border-red-500/20',
		hover: 'hover:bg-red-500/10',
	},
	[ENTITY_TYPES.NPC]: {
		text: 'text-[var(--entity-npc,theme(colors.amber.500))]',
		bg: 'bg-amber-500/10',
		border: 'border-amber-500/20',
		hover: 'hover:bg-amber-500/10',
	},
	[ENTITY_TYPES.LOCATION]: {
		text: 'text-[var(--entity-location,theme(colors.emerald.500))]', // Will use moss green on D&D theme
		bg: 'bg-emerald-500/10',
		border: 'border-emerald-500/20',
		hover: 'hover:bg-emerald-500/10',
	},
	[ENTITY_TYPES.QUEST]: {
		text: 'text-[var(--entity-quest,theme(colors.blue.500))]',
		bg: 'bg-blue-500/10',
		border: 'border-blue-500/20',
		hover: 'hover:bg-blue-500/10',
	},
	[ENTITY_TYPES.FACTION]: {
		text: 'text-[var(--entity-faction,theme(colors.purple.500))]',
		bg: 'bg-purple-500/10',
		border: 'border-purple-500/20',
		hover: 'hover:bg-purple-500/10',
	},
	[ENTITY_TYPES.ENCOUNTER]: {
		text: 'text-[var(--entity-encounter,theme(colors.orange.500))]',
		bg: 'bg-orange-500/10',
		border: 'border-orange-500/20',
		hover: 'hover:bg-orange-500/10',
	},
	[ENTITY_TYPES.DEFAULT]: {
		text: 'text-muted-foreground',
		bg: 'bg-muted',
		border: 'border-border',
		hover: 'hover:bg-muted/80',
	},
};

export const getEntityStyles = (type) => {
	const normalized = type?.toLowerCase() || ENTITY_TYPES.DEFAULT;
	return ENTITY_TAILWIND_CLASSES[normalized] || ENTITY_TAILWIND_CLASSES[ENTITY_TYPES.DEFAULT];
};

export const buildEntityClassName = (type, variants = [], additional = '') => {
	const styles = getEntityStyles(type);
	const variantList = Array.isArray(variants) ? variants : [variants];
	const classes = variantList
		.map((variant) => styles[variant])
		.filter(Boolean)
		.join(' ');
	return additional ? `${classes} ${additional}` : classes;
};

// Priority Badges - Using semantic opacity for better dark/light compatibility
export const getPriorityStyles = (priority) => {
	const p = priority?.toLowerCase() || '';
	if (p.includes('high') || p.includes('urgent') || p.includes('critical')) {
		return 'border-orange-500/30 text-orange-700 dark:text-orange-400 bg-orange-500/10';
	}
	if (p.includes('medium') || p.includes('normal')) {
		return 'border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10';
	}
	if (p.includes('low')) {
		return 'border-border text-muted-foreground bg-muted/50';
	}
	return 'border-border text-muted-foreground bg-muted/30';
};

export const ENTITY_CLASS_PRESETS = {
	iconBadge: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.bg} ${styles.border} ${styles.text} rounded-lg p-2 border`;
	},
	typeBadge: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.bg} ${styles.text} ${styles.border} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border`;
	},
	card: (type) => {
		const styles = getEntityStyles(type);
		// Force bg-card to ensure cards are readable on all themes
		return `bg-card border-border border rounded-lg p-4 ${styles.hover} transition-colors`;
	},
	link: (type) => {
		const styles = getEntityStyles(type);
		return `${styles.text} transition-colors font-semibold hover:underline`;
	},
};

export const getEntityPreset = (preset, type) => {
	const presetFn = ENTITY_CLASS_PRESETS[preset];
	return presetFn ? presetFn(type) : '';
};
