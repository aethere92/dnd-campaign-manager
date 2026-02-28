---
inclusion: fileMatch
fileMatchPattern: "**/smart-text/**,**/smart-tooltip/**"
---

# Smart Text System Guide

## Overview
The smart text system provides automatic entity linking within markdown content. Rather than requiring explicit `[[entity_id]]` syntax, it detects entity names and aliases in plain text using word boundary matching and converts them to interactive links with hover tooltips.

## How It Works

### Processing Pipeline
1. `useSmartText(text)` receives raw markdown text
2. Existing markdown links are protected from re-processing via regex split
3. Entity names and aliases are matched using `\b` word boundaries (case-insensitive)
4. Matches are sorted longest-first to prevent partial matches (e.g., "Captain Soranna" before "Soranna")
5. Matched text is replaced with markdown links: `[matched text](#entity/id/type)`
6. `SmartMarkdown` renders the processed text via `react-markdown`
7. Custom `a` component intercepts `#entity/` links and renders `SmartEntityLink` or plain `Link`

### Key Files
```
src/features/smart-text/
├── SmartMarkdown.jsx      # ReactMarkdown wrapper with custom link renderer
├── useSmartText.js        # Text processing hook (matching + replacement)
├── useEntityIndex.js      # Entity index builder (list, map, searchTokens)
└── components/
    ├── SmartEntityLink.jsx  # Interactive link with tooltip trigger
    └── EntityEmbed.jsx      # Embedded entity card (::label:: syntax)
```

## Core Components

### SmartMarkdown
Main component for rendering markdown with entity links:
```javascript
import SmartMarkdown from '@/features/smart-text/SmartMarkdown';

// Standard usage
<SmartMarkdown>{entity.description}</SmartMarkdown>

// Inline mode (strips <p> tags)
<SmartMarkdown inline={true}>{text}</SmartMarkdown>

// Disable tooltips (used inside tooltips to prevent recursion)
<SmartMarkdown inline={true} disableTooltips={true}>{text}</SmartMarkdown>
```

Features:
- Auto-generates heading IDs for table-of-contents integration
- Handles `#entity/` links → `SmartEntityLink` (with tooltips) or plain `Link` (when tooltips disabled)
- Supports entity embeds via `::label::` display text syntax
- External links open in new tab with `rel="noopener noreferrer"`

### Entity Index Hook
Builds and caches the entity lookup index:
```javascript
const { list, map, searchTokens } = useEntityIndex();

// list: Array of lightweight entity objects with iconUrl, parentId
// map: Map<entityId, entity> for O(1) lookups
// searchTokens: Array of { term, entityId, type } sorted by term length DESC
```

The index is fetched from `view_entity_index` (lightweight Supabase view) and includes:
- Primary entity names
- Aliases (from `attributes.aliases` — array or comma-separated string)
- Only terms longer than 2 characters

Cache: `queryKey: ['entityIndex', campaignId]`, staleTime: 30 minutes

### useSmartText Hook
Processes text and returns entity-linked markdown:
```javascript
const processedText = useSmartText(rawText);
// Returns markdown string with entity references converted to links
```

Matching algorithm:
- Iterates searchTokens (longest first)
- Uses `\b` word boundaries for precise matching
- Tracks processed ranges to prevent overlapping matches
- Preserves original text casing in the link display

## Tooltip System

### Architecture
```
src/features/smart-tooltip/
├── TooltipContext.jsx      # Provider with openTooltip/closeTooltip/cancelClose
├── TooltipContainer.jsx    # Portal-rendered overlay layer
├── useTooltipState.js      # State management with delayed close
├── useSmartPosition.js     # Viewport-aware positioning
├── config/
│   └── tooltipProfiles.js  # Per-entity-type field configuration
└── components/
    └── TooltipCard.jsx     # Rich tooltip card with entity data
```

### TooltipContext
```javascript
const { openTooltip, closeTooltip, cancelClose } = useTooltip();
```

Graceful degradation: if used outside `TooltipProvider`, returns dummy no-op functions instead of throwing.

### Tooltip Profiles
Each entity type has a profile defining which fields to display:
```javascript
// Example: NPC profile
npc: {
  subtitle: ['gender', 'race', 'role'],
  tags: ['status', 'affinity'],
  features: { showPersonality: true },
}

// Example: Character profile
character: {
  subtitle: ['level_prefix', 'race', 'class'],
  tags: ['status'],
  features: { showHP: true, showArmorClass: true, showMovement: true },
}
```

### TooltipCard Content
Renders entity-specific rich content:
- Header image (from `background` attribute) or fallback gradient with entity icon
- Entity type badge with color from entity palette
- Name, subtitle line (joined with •)
- Stat badges: HP (heart), AC (shield), Movement (wind)
- Status dot (alive/dead/active/completed)
- Affinity tag (ally/enemy with color coding)
- Personality quote (italic, bordered)
- Description with SmartMarkdown (tooltips disabled to prevent recursion)
- Footer with ruler info and "Open Wiki" link

### Smart Positioning
`useSmartPosition` handles viewport boundary detection:
- Adjusts tooltip position to stay within viewport
- Handles scroll events
- Returns `{ style, tooltipRef }` for the tooltip container

## Best Practices

### Content Writing
- Entity names are automatically linked — no special syntax needed for plain text
- Use aliases in entity attributes to catch alternate names
- Longer, more specific names take priority over shorter ones

### Performance
- Entity index loaded once per campaign and cached
- Tooltips rendered in portal outside DOM hierarchy
- Delayed close prevents flickering when moving between link and tooltip
- `disableTooltips` prop prevents recursive tooltip rendering

### Error Handling
- Missing entities in index are silently skipped (no broken links)
- SmartMarkdown catches processing errors and falls back to raw text
- TooltipContext returns no-op functions when used outside provider
