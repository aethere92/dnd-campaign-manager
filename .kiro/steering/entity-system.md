---
inclusion: fileMatch
fileMatchPattern: "**/entity/**"
---

# Entity System Guide

## Overview
The entity system is the core data model for all campaign content. Every piece of content (sessions, characters, NPCs, locations, etc.) is represented as an entity with a consistent structure.

## Entity Types

### Core Types
```javascript
ENTITY_TYPES = {
  SESSION: 'session',      // Game sessions with narrative
  CHARACTER: 'character',  // Player characters
  NPC: 'npc',             // Non-player characters
  LOCATION: 'location',   // Places in the world
  QUEST: 'quest',         // Objectives and missions
  FACTION: 'faction',     // Organizations
  ENCOUNTER: 'encounter', // Combat encounters
  ITEM: 'item',          // Equipment and magic items
}
```

## Entity Structure

### Database Schema
```sql
entities (
  id              TEXT PRIMARY KEY,
  campaign_id     TEXT NOT NULL,
  type            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  content         TEXT,
  metadata        JSONB,
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP
)
```

### Metadata Field
The `metadata` JSONB field stores type-specific data:

**Character/NPC:**
```json
{
  "class": "Fighter",
  "level": 5,
  "race": "Human",
  "alignment": "Lawful Good",
  "status": "alive"
}
```

**Location:**
```json
{
  "region": "Elsir Vale",
  "type": "city",
  "population": 5000,
  "coordinates": { "lat": 45.2, "lng": -122.5 }
}
```

**Quest:**
```json
{
  "status": "active",
  "giver": "npc_id",
  "reward": "500 gold",
  "difficulty": "medium"
}
```

**Faction:**
```json
{
  "alignment": "neutral",
  "influence": "regional",
  "leader": "npc_id"
}
```

## Entity Relationships

### Relationship Types
```javascript
RELATIONSHIP_TYPES = {
  ALLY: 'ally',
  ENEMY: 'enemy',
  NEUTRAL: 'neutral',
  MEMBER: 'member',
  LEADER: 'leader',
  LOCATED_IN: 'located_in',
  RELATED_TO: 'related_to'
}
```

### Relationship Schema
```sql
entity_relationships (
  id              UUID PRIMARY KEY,
  campaign_id     TEXT NOT NULL,
  source_id       TEXT NOT NULL,
  target_id       TEXT NOT NULL,
  relationship    TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMP
)
```

## Entity Linking

### Smart Text Syntax
Link entities in markdown content using double brackets:
```markdown
The party met [[npc_gandalf]] in [[loc_rivendell]].
They accepted [[quest_destroy_ring]] from him.
```

### Entity Index
The entity index provides fast lookups for entity linking:
```javascript
const { entityIndex } = useEntityIndex(campaignId);

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

### Tooltip Integration
Linked entities automatically show tooltips on hover with:
- Entity name and type
- Short description
- Quick actions (view details, etc.)

## Working with Entities

### Fetching Entities
```javascript
// Fetch all entities of a type
const { data: npcs } = useQuery({
  queryKey: ['entities', campaignId, 'npc'],
  queryFn: () => fetchEntities(campaignId, 'npc'),
});

// Fetch single entity
const { data: entity } = useQuery({
  queryKey: ['entity', campaignId, entityId],
  queryFn: () => fetchEntity(campaignId, entityId),
});
```

### Creating Entities
```javascript
const createEntity = async (campaignId, entityData) => {
  const { data, error } = await supabase
    .from('entities')
    .insert({
      id: generateEntityId(entityData.type, entityData.name),
      campaign_id: campaignId,
      type: entityData.type,
      name: entityData.name,
      description: entityData.description,
      content: entityData.content,
      metadata: entityData.metadata,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### Updating Entities
```javascript
const updateEntity = async (campaignId, entityId, updates) => {
  const { data, error } = await supabase
    .from('entities')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('campaign_id', campaignId)
    .eq('id', entityId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

## Entity ID Convention

### Format
Entity IDs follow the pattern: `{type}_{slug}`

Examples:
- `char_kaedin` - Character named Kaedin
- `npc_soranna` - NPC named Soranna
- `loc_brindol` - Location named Brindol
- `quest_red_hand` - Quest named Red Hand

### Generation
```javascript
const generateEntityId = (type, name) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${type}_${slug}`;
};
```

## Entity Images

### Image Paths
Images are organized by campaign and type:
```
public/images/{campaign_id}/{type}s/{entity_id}_{variant}.webp
```

Variants:
- `icon` - Small square (64x64 to 128x128)
- `portrait` - Medium (256x256 to 512x512)
- `header` - Wide banner (1200x400 or similar)

Examples:
- `public/images/c02/chars/kaedin_icon.webp`
- `public/images/c02/npcs/soranna_portrait.webp`
- `public/images/c02/locs/brindol_header.webp`

### Image Utilities
```javascript
import { getEntityImage } from '@/shared/utils/imageUtils';

const iconUrl = getEntityImage(campaignId, 'character', 'kaedin', 'icon');
const portraitUrl = getEntityImage(campaignId, 'npc', 'soranna', 'portrait');
```

## Entity Views

### Wiki Pages
Each entity type has a wiki view at `/wiki/{type}/{entityId}`:
- Header with image and metadata
- Full content with smart text rendering
- Related entities section
- Relationship graph
- Timeline of mentions

### Entity Cards
Reusable card components for entity lists:
```javascript
<EntityCard
  entity={entity}
  variant="compact"
  showImage={true}
  onClick={() => navigate(`/wiki/${entity.type}/${entity.id}`)}
/>
```

## Best Practices

### Entity Creation
- Use descriptive, unique names
- Provide meaningful descriptions (used in tooltips)
- Structure metadata consistently within each type
- Add relationships to connect entities

### Content Writing
- Use entity links liberally in content
- Link entities on first mention in each section
- Verify entity IDs exist before linking
- Use consistent entity naming

### Performance
- Fetch only needed entity types
- Use entity index for lookups instead of repeated queries
- Cache entity data with TanStack Query
- Lazy load entity details on demand

### Data Integrity
- Validate entity IDs before creating relationships
- Clean up orphaned relationships when deleting entities
- Maintain referential integrity in metadata
- Use transactions for multi-entity operations
