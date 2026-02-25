---
inclusion: fileMatch
fileMatchPattern: "**/smart-text/**"
---

# Smart Text System Guide

## Overview
The smart text system enables entity linking within markdown content. When entities are referenced using `[[entity_id]]` syntax, they become interactive links with hover tooltips.

## Core Components

### SmartMarkdown
Main component for rendering markdown with entity links:
```javascript
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

<SmartMarkdown content={entity.content} campaignId={campaignId} />
```

### Entity Index Hook
Provides fast entity lookups:
```javascript
const { entityIndex, isLoading } = useEntityIndex(campaignId);

// entityIndex structure:
{
  'npc_gandalf': {
    id: 'npc_gandalf',
    name: 'Gandalf',
    type: 'npc',
    description: 'A wise wizard...'
  }
}
```

## Entity Linking Syntax

### Basic Linking
```markdown
The party met [[npc_gandalf]] in [[loc_rivendell]].
```

### Display Text Override
```markdown
They spoke with [[npc_gandalf|the wizard]].
```

### Multiple References
```markdown
[[char_frodo]] and [[char_sam]] traveled to [[loc_mordor]] 
to complete [[quest_destroy_ring]].
```

## Smart Text Parser

### Parsing Process
1. Detect `[[entity_id]]` or `[[entity_id|display]]` patterns
2. Look up entity in entity index
3. Replace with interactive link component
4. Attach tooltip handlers


### Custom Components
```javascript
const components = {
  entityLink: ({ entityId, displayText, entity }) => (
    <EntityLink
      entityId={entityId}
      displayText={displayText}
      entity={entity}
    />
  ),
};
```

## Tooltip System

### TooltipContext
Global context for managing tooltip state:
```javascript
const { showTooltip, hideTooltip, tooltipData } = useTooltip();

// Show tooltip
showTooltip({
  entityId: 'npc_gandalf',
  entity: entityData,
  position: { x: 100, y: 200 },
});

// Hide tooltip
hideTooltip();
```

### Tooltip Positioning
Smart positioning algorithm:
- Detects viewport boundaries
- Adjusts position to stay visible
- Handles scroll events
- Repositions on window resize

### Tooltip Content
Displays:
- Entity name and type badge
- Short description (truncated)
- Quick action buttons (view, edit)
- Related entity count

## Implementation Details

### Entity Link Component
```javascript
export default function EntityLink({ entityId, displayText, entity }) {
  const { showTooltip, hideTooltip } = useTooltip();
  const linkRef = useRef(null);

  const handleMouseEnter = () => {
    const rect = linkRef.current.getBoundingClientRect();
    showTooltip({
      entityId,
      entity,
      position: { x: rect.left, y: rect.bottom },
    });
  };

  return (
    <span
      ref={linkRef}
      className="entity-link"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={hideTooltip}
    >
      {displayText || entity?.name || entityId}
    </span>
  );
}
```

### Markdown Processing
```javascript
const processMarkdown = (content, entityIndex) => {
  const entityLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  
  return content.replace(entityLinkRegex, (match, entityId, displayText) => {
    const entity = entityIndex[entityId];
    if (!entity) return match; // Keep original if not found
    
    return renderEntityLink(entityId, displayText, entity);
  });
};
```

## Entity Index Building

### Index Structure
```javascript
{
  [entityId]: {
    id: string,
    name: string,
    type: string,
    description: string,
    metadata: object,
  }
}
```

### Index Generation
```javascript
const buildEntityIndex = (entities) => {
  return entities.reduce((index, entity) => {
    index[entity.id] = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      metadata: entity.metadata,
    };
    return index;
  }, {});
};
```

### Caching Strategy
- Entity index cached with TanStack Query
- Cache key: `['entityIndex', campaignId]`
- Stale time: 1 hour
- Invalidated on campaign change

## Best Practices

### Content Writing
- Link entities on first mention in each section
- Use display text for better readability
- Verify entity IDs exist before linking
- Keep entity names consistent

### Performance
- Entity index loaded once per campaign
- Tooltips rendered in portal (outside DOM hierarchy)
- Debounce tooltip show/hide events
- Lazy load tooltip content

### Error Handling
- Gracefully handle missing entities
- Show original text if entity not found
- Log warnings for broken links
- Provide admin tools to find broken links

### Accessibility
- Entity links are keyboard navigable
- Tooltips have ARIA labels
- Screen reader friendly descriptions
- Focus management for tooltip interactions

## Advanced Features

### Entity Mention Tracking
Track where entities are mentioned:
```javascript
const mentions = findEntityMentions(content, entityId);
// Returns array of { sessionId, context }
```

### Bulk Link Validation
Check for broken entity links:
```javascript
const brokenLinks = validateEntityLinks(content, entityIndex);
// Returns array of missing entity IDs
```

### Link Suggestions
Suggest entity links based on text:
```javascript
const suggestions = suggestEntityLinks(content, entityIndex);
// Returns array of { text, entityId, confidence }
```

## Troubleshooting

### Links Not Working
- Verify entity ID format: `{type}_{slug}`
- Check entity exists in database
- Ensure entity index is loaded
- Check for typos in entity ID

### Tooltips Not Showing
- Verify TooltipProvider wraps app
- Check tooltip positioning logic
- Ensure entity data is available
- Check z-index conflicts

### Performance Issues
- Reduce entity index size (fetch only needed fields)
- Implement virtual scrolling for long content
- Debounce tooltip events
- Use React.memo for entity links
