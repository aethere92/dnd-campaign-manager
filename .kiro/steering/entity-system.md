---
inclusion: fileMatch
fileMatchPattern: "**/entity/**,**/wiki/**"
---

# Entity System Guide

## Overview
The entity system is the core data model for all campaign content. Every piece of content (sessions, characters, NPCs, locations, etc.) is represented as an entity with a consistent structure.

## Entity Types

### Core Types
```javascript
// src/domain/entity/config/entityTypes.js
ENTITY_TYPES = {
  SESSION: 'session',
  CHARACTER: 'character',
  NPC: 'npc',
  LOCATION: 'location',
  QUEST: 'quest',
  FACTION: 'faction',
  ENCOUNTER: 'encounter',
  ITEM: 'item',
  DEFAULT: 'default',
}
```

## Entity Configuration (Modular System)

Configuration is split across focused modules in `src/domain/entity/config/`:

| Module | Purpose | Key Export |
|--------|---------|-----------|
| `entityTypes.js` | Type constants, labels (singular + plural) | `ENTITY_TYPES`, `getEntityLabel(type, plural?)` |
| `entityIcons.js` | Lucide icon component per type | `getEntityIcon(type)` |
| `entityColors.js` | Hex colors + full palettes (50–900 shades) | `getEntityColor(type)`, `getEntityPalette(type)` |
| `entityStyles.js` | Tailwind class presets | `getEntityStyles(type)`, `getEntityPreset(type)` |
| `entityConfig.js` | Unified orchestrator | `getEntityConfig(type)` → `{ type, label, icon, color, palette, tailwind }` |

### Usage
```javascript
import { getEntityConfig } from '@/domain/entity/config/entityConfig';
const config = getEntityConfig('npc');
// { type: 'npc', label: 'NPC', icon: UsersIcon, color: '#d97706', palette: {...}, tailwind: {...} }

// Or import specific modules directly:
import { getEntityColor } from '@/domain/entity/config/entityColors';
import { getEntityIcon } from '@/domain/entity/config/entityIcons';
```

Legacy `ENTITY_CONFIG` map is still exported for backward compatibility but prefer `getEntityConfig()`.

## Entity Utilities

Located in `src/domain/entity/utils/`:

- `entityUtils.js` - Type checking (`isSession`, `isNPC`, etc.), name/description resolution, status checks, parent ID resolution from relationships
- `attributeParser.js` - Parse and extract values from entity attributes JSONB
- `statusUtils.js` - Status-related display logic

### Key Utility: `getParentId(entity)`
Determines parent entity from relationships:
1. Checks for explicit `parent_location` or `parent` relationship
2. For NPCs/encounters: finds linked location via semantic relationship types (`located_in`, `base`, `home`, etc.)
3. Falls back to first location relationship found

## Domain Components

Located in `src/domain/entity/components/`:
- `EntityBadge.jsx` - Type badge with icon and color
- `EntityIcon.jsx` - Standalone entity type icon
- `EntityLink.jsx` - Navigable entity link
- `EntityStatusIcon.jsx` - Status indicator icon

## Data Fetching (Strategy Pattern)

The entity service (`src/domain/entity/api/entityService.js`) uses a strategy pattern:

```javascript
const entityStrategies = {
  session: getSessions,        // Uses view_campaign_timeline
  quest: getCompleteEntities,  // Uses entity_complete_view
  map: getMaps,                // Uses maps table
  campaign: getCampaigns,      // Uses campaigns table
  default: getCompleteEntities,
};
```

### Supabase Views Used
- `view_campaign_timeline` - Pre-aggregated session data with events and tags
- `entity_complete_view` - Full entity with relationships JSON
- `view_entity_index` - Lightweight index for smart-text (id, name, type, icon, status, affinity, aliases)
- `view_campaign_graph` - Graph nodes with adjacency lists
- `view_narrative_arc_summary` - Arc metadata for session grouping
- `view_encounter_actions_hydrated` - Encounter round/action details

### Wiki Entry Fetching
`getWikiEntry(id, type)` uses type-specific strategies:
- **session** → `fetchSessionWikiEntry` (timeline view + direct relationships + event tag map)
- **encounter** → `fetchEncounterWikiEntry` (entity data + hydrated actions)
- **quest** → `fetchQuestWikiEntry` (entity data + objectives with session links)
- **default** → entity_complete_view single row

### Query Key Conventions
```javascript
['entityIndex', campaignId]              // Smart-text index
['entities', campaignId, type]           // Entity list
['entry', campaignId, entityId]          // Wiki detail
['timeline', campaignId]                 // Timeline
['graph', campaignId]                    // Graph data
['globalSearch', campaignId]             // Search index
```

## Wiki View System

### View Strategies (Landing Pages)
`src/features/wiki/config/viewStrategies.js` defines how entity lists are organized:

```javascript
VIEW_STRATEGIES = {
  location:  { mode: 'geo' },       // Hierarchical swimlanes from location tree
  encounter: { mode: 'geo' },
  npc:       { mode: 'geo' },
  faction:   { mode: 'category' },  // Grouped by category
  quest:     { mode: 'category' },
  session:   { mode: 'category' },  // Grouped by narrative arc
  character: { mode: 'flat' },      // Alphabetical flat list
  item:      { mode: 'flat' },
};
```

### Layout Modes (Detail Pages)
`useEntityViewModel` determines layout mode:
- **tabs** (session) → `SessionLayout` with tabbed events/narrative
- **character** → `CharacterLayout` with stats display
- **standard** → `StandardLayout` for all other types

The view model provides: `{ layoutMode, header, sidebar, content, raw }`

## Entity Relationships

### Schema
```sql
entity_relationships (
  id                UUID PRIMARY KEY,
  from_entity_id    TEXT NOT NULL,
  to_entity_id      TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  metadata          JSONB
)
```

### Common Relationship Types
- `parent_location`, `parent` - Hierarchical containment
- `located_in`, `base`, `home`, `residence` - Location associations
- `part_of` - Arc/group membership (sessions → narrative arcs)
- `mention` - Entity mentioned in session event
- `ally`, `enemy`, `member`, `leader` - Social relationships

## Entity Images

### Path Convention
```
public/images/{campaign_id}/{type}/{entity_slug}_{variant}.webp
```

Type folders use short names: `chars/`, `npcs/`, `locs/`, `items/`, `encounters/`, `factions/`, `sessions/`

Variants: `icon`, `portrait`, `header`, `map`

### Image Resolution
```javascript
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';

const attrs = parseAttributes(entity.attributes);
const bgImage = resolveImageUrl(attrs, 'background');
const iconImage = resolveImageUrl(attrs, 'icon');
```

## Best Practices

### Entity Creation
- Use descriptive, unique names
- Provide meaningful descriptions (shown in tooltips and search)
- Add aliases for alternate names (improves smart-text matching)
- Structure attributes consistently within each type
- Add relationships to connect entities in the graph

### Performance
- Use `view_entity_index` for lightweight lookups, `entity_complete_view` for full data
- Entity index cached with 30min stale time
- Lazy load entity details on demand via wiki entry strategies
