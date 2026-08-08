import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxUsesVars from './eslint-rules/jsx-uses-vars.js';

export default defineConfig([
	globalIgnores([
		'dist',
		// One-off migration/split scripts, kept for reference outside src/.
		'tools/**',
		'scripts/legacy/**',
		// Generated map coordinate data
		'src/features/atlas/data/campaign_01/**',
		'src/features/atlas/data/campaign_02/**',
	]),
	{
		files: ['**/*.{js,jsx}'],
		extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
		languageOptions: {
			ecmaVersion: 'latest',
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		plugins: {
			local: { rules: { 'jsx-uses-vars': jsxUsesVars } },
		},
		rules: {
			// Teaches no-unused-vars to see JSX references. Without this, `<Icon />` or
			// `<config.icon />` does not count as using `Icon`/`config`, and the fix for
			// the resulting false positive (renaming to `_config`) is a runtime crash.
			// See eslint-rules/jsx-uses-vars.js.
			'local/jsx-uses-vars': 'error',

			// `argsIgnorePattern: '^_'` lets you mark a deliberately-unused parameter
			// as `_e`. `caughtErrors: 'none'` allows `catch (e) {}` where the error is
			// genuinely irrelevant.
			//
			// No varsIgnorePattern: with local/jsx-uses-vars above, JSX references are
			// counted properly, so capitalised names no longer need a blanket exemption
			// that would also hide genuinely-unused components and constants.
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrors: 'none',
					ignoreRestSiblings: true,
				},
			],

			// Catch Tailwind utilities with two opacity modifiers (e.g.
			// `bg-amber-500/10/30`). Tailwind can't parse these, so the whole utility
			// is silently dropped — 9 of them had accumulated, which is why the active
			// tab had no highlight and completed/failed quest objectives looked
			// identical. Cheap to detect, invisible otherwise.
			'no-restricted-syntax': [
				'error',
				{
					selector:
						'Literal[value=/(?:bg|text|border|ring|from|to|via|divide|outline|shadow|fill|stroke|accent|caret|decoration|placeholder)-[a-z]+(?:-[0-9]+)?\\u002F[0-9]+\\u002F[0-9]+/]',
					// NB: no literal example here — the message string is itself a Literal,
					// so an example would match the selector and flag this file.
					message:
						'Tailwind utility has two opacity modifiers and will be silently dropped by Tailwind. Use a single opacity.',
				},
			],
		},
	},
	{
		// These five files assign a Lucide icon component from a lookup helper
		// (getEntityIcon / getActionIcon / resolveEntityIcon), each of which indexes a
		// static map and returns an already-defined component. The rule reads the
		// assignment as creating a component during render, which it is not — the
		// returned reference is stable across renders, so no remount occurs.
		//
		// Disabled per-file rather than per-line because the rule reports at every USE
		// site, not the declaration, which would mean scattering directives.
		files: [
			'src/domain/entity/components/EntityIcon.jsx',
			'src/features/wiki/components/EncounterTimeline.jsx',
			'src/features/wiki/components/navigation/sidebar/EntityListItem.jsx',
			'src/features/wiki/components/navigation/sidebar/SidebarTreeItem.jsx',
		],
		rules: {
			'react-hooks/static-components': 'off',
		},
	},
	{
		// Context files intentionally export a provider component *and* its consumer
		// hook side by side — the pattern React's own docs use. Splitting them would
		// mean a second file per context and rewriting imports in ~45 call sites, for
		// a dev-only benefit: react-refresh can't hot-reload a module with mixed
		// exports, so edits to these files do a full reload instead of a fast refresh.
		//
		// allowExportNames tells the rule about the specific non-component exports
		// rather than switching the rule off, so an accidental extra export in one of
		// these files is still reported.
		files: [
			'src/features/campaign/CampaignContext.jsx',
			'src/features/search/SearchContext.jsx',
			'src/features/smart-tooltip/TooltipContext.jsx',
			'src/features/atlas/context/AtlasContext.jsx',
			'src/features/admin/atlas-editor/AtlasEditorContext.jsx',
		],
		rules: {
			'react-refresh/only-export-components': [
				'error',
				{
					allowExportNames: ['useCampaign', 'useSearch', 'useTooltip', 'useAtlas', 'useAtlasEditor'],
				},
			],
		},
	},
	{
		// Node scripts run outside the browser.
		files: ['scripts/**/*.{js,mjs}', 'vite.config.js', 'eslint.config.js'],
		languageOptions: {
			globals: globals.node,
		},
	},
]);
