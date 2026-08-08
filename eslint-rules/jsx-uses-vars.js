/**
 * Marks variables referenced from JSX as "used", so the core `no-unused-vars`
 * rule stops reporting them.
 *
 * WHY THIS EXISTS
 * ESLint's core `no-unused-vars` does not understand JSX. A component received as
 * a prop and rendered as `<Icon />`, or a config object rendered as
 * `<config.icon />`, counts as unused and gets reported — even though deleting or
 * renaming it breaks the component at runtime. (That is not hypothetical: renaming
 * such a prop to `_config` to silence the rule produced a
 * "ReferenceError: config is not defined" crash on page load.)
 *
 * The usual fix is eslint-plugin-react's `jsx-uses-vars` rule. This project does
 * not depend on eslint-plugin-react, and adding a dependency for one small rule
 * is not worth it, so the rule is reimplemented here — it is genuinely this short.
 *
 * The alternative (a `varsIgnorePattern` that skips every capitalised name) also
 * silences the false positives, but it hides *real* unused variables at the same
 * time, since components and constants are capitalised by convention.
 */
export default {
	meta: {
		type: 'problem',
		docs: { description: 'Mark variables used in JSX as used for no-unused-vars.' },
		schema: [],
	},

	create(context) {
		/**
		 * `<Foo />` and `<Foo.Bar />` both resolve to the identifier `Foo`; walk down
		 * the member expression to reach it. Namespaced JSX (`<svg:rect />`) has no
		 * backing variable, so it is ignored.
		 */
		function markUsed(node) {
			let name = node;
			while (name.type === 'JSXMemberExpression') name = name.object;
			if (name.type !== 'JSXIdentifier') return;

			// Intrinsic elements (`div`, `span`) are never variables. Custom
			// components always start with an uppercase letter, but a lowercase
			// identifier can still be a variable if it is in scope, so defer to the
			// scope chain rather than guessing from the casing.
			context.sourceCode.markVariableAsUsed(name.name, name);
		}

		return {
			JSXOpeningElement: (node) => markUsed(node.name),
		};
	},
};
