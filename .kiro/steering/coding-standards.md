---
inclusion: always
---

# Coding Standards

## File Organization

### Naming Conventions
- **Components**: PascalCase (e.g., `EntityCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useEntityView.js`)
- **Utils**: camelCase (e.g., `textUtils.js`)
- **Constants/Config**: camelCase (e.g., `entityTypes.js`)
- **API functions**: camelCase (e.g., `fetchEntities.js`)

### File Extensions
- `.jsx` for components with JSX
- `.js` for utilities, hooks, and logic

### Import Aliases
Use `@/` alias for absolute imports from `src/`:
```javascript
import { EntityCard } from '@/domain/entity/components/EntityCard';
import { useTheme } from '@/shared/hooks/useTheme';
```

## Component Patterns

### Functional Components
Always use functional components with hooks:
```javascript
export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return <div>{/* JSX */}</div>;
}
```

### Component Structure
Order elements in this sequence:
1. Imports
2. Constants/Config (outside component)
3. Component definition
4. Hooks (useState, useEffect, custom hooks)
5. Event handlers
6. Derived state/computed values
7. Early returns (loading, error states)
8. Main JSX return

### Props Destructuring
Destructure props in function signature:
```javascript
// Good
export default function Card({ title, description, onClick }) {
  return <div onClick={onClick}>{title}</div>;
}

// Avoid
export default function Card(props) {
  return <div onClick={props.onClick}>{props.title}</div>;
}
```

## React Patterns

### Hooks Usage
- Use custom hooks for reusable logic
- Keep hooks at top level (never in conditionals)
- Name custom hooks with `use` prefix
- Extract complex logic into custom hooks

### State Management
- Use Context for cross-cutting concerns (campaign, tooltips, search)
- Use TanStack Query for server state
- Use local state for UI-only state
- Avoid prop drilling - use Context when passing props 3+ levels

### Data Fetching
Use TanStack Query for all API calls:
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['entities', campaignId, type],
  queryFn: () => fetchEntities(campaignId, type),
  enabled: !!campaignId,
});
```

### Conditional Rendering
Use early returns for loading/error states:
```javascript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <div>{/* Main content */}</div>;
```

## Styling

### Tailwind CSS
- Use Tailwind utility classes for styling
- Use `clsx` or `tailwind-merge` for conditional classes
- Define custom utilities in `global.css` when needed
- Use CSS custom properties for theme values

### Class Organization
Group classes logically:
```javascript
<div className={clsx(
  // Layout
  'flex items-center gap-4',
  // Sizing
  'w-full h-12',
  // Colors
  'bg-white text-gray-900',
  // States
  'hover:bg-gray-50 active:bg-gray-100',
  // Conditional
  isActive && 'border-blue-500'
)}>
```

## API & Data

### Supabase Queries
- Use the shared Supabase client from `@/shared/api/supabaseClient`
- Always handle errors gracefully
- Use `.select()` to specify needed columns
- Use `.single()` for single row queries

### Error Handling
```javascript
try {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('campaign_id', campaignId);
    
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Failed to fetch entities:', error);
  throw error;
}
```

### Query Keys
Use consistent query key patterns:
```javascript
['entityIndex', campaignId]              // Smart-text entity index
['entities', campaignId, type]           // Entity list by type
['entry', campaignId, entityId]          // Wiki detail page
['timeline', campaignId]                 // Timeline data
['graph', campaignId]                    // Relationship graph
['globalSearch', campaignId]             // Search index
```

## Performance

### Optimization Strategies
- Lazy load route components
- Use React.memo for expensive components
- Memoize callbacks with useCallback
- Memoize computed values with useMemo
- Leverage TanStack Query caching

### Image Optimization
- Use WebP format for all images
- Provide appropriate sizes for different contexts (icon, portrait, header)
- Use lazy loading for images below the fold

## Code Quality

### Comments
- Use JSDoc for function documentation
- Comment complex logic and business rules
- Avoid obvious comments
- Keep comments up to date

### Console Logs
- Remove debug console.logs before committing
- Use console.error for errors
- Use console.warn for warnings

### Linting
- Follow ESLint configuration
- Fix linting errors before committing
- Use Prettier for consistent formatting

## Testing

### Manual Testing
- Test in both dev and production builds
- Test campaign switching
- Test navigation and deep linking
- Test error states and edge cases

### Browser Support
- Target modern browsers (last 2 versions)
- Test responsive layouts on mobile
- Ensure accessibility basics (keyboard nav, ARIA)

## Git Practices

### Commits
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issue numbers when applicable

### Branches
- Use feature branches for new work
- Keep branches up to date with main
- Delete branches after merging
