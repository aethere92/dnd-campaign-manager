---
inclusion: fileMatch
fileMatchPattern: "**/admin/**"
---

# Admin Console Guide

## Overview
The admin console (`/dm/*` routes) provides a comprehensive interface for managing campaign content. Only available in development mode (`import.meta.env.DEV`).

## Structure
```
src/features/admin/
├── api/
│   └── adminService.js    # Full CRUD operations
├── components/            # Reusable admin UI components
├── config/                # Admin configuration
├── layouts/
│   └── AdminLayout.jsx    # Sidebar + outlet layout
├── pages/
│   ├── SplitPaneManager.jsx  # Entity CRUD split-pane
│   ├── BulkReplaceTool.jsx   # Find & replace
│   ├── MapMigrationTool.jsx  # Map data migration
│   └── MapManagerPage.jsx    # Visual map manager
└── utils/                 # Admin utilities
```

## Routes
- `/dm` → Redirects to `/dm/manage/campaign`
- `/dm/manage/:type/:id?` → Entity CRUD (split-pane editor)
- `/dm/tools/replace` → Bulk text find & replace
- `/dm/tools/migration` → Map data migration
- `/dm/tools/atlas` → Visual map manager

## Sidebar Navigation
The admin sidebar organizes management into sections:

**System**: Campaigns, Find & Replace
**Atlas**: Map Migration, Atlas Manager, Maps (DB)
**Entities**: Characters, NPCs, Locations, Factions, Items, Encounters
**Campaign**: Chronicles (sessions), Narrative Arcs, Quests

Footer: "Enter Campaign" link (returns to public app), "Campaign Select" button

Includes theme toggle (Dark/D&D/Light cycle).

## Entity Management (`/dm/manage/:type/:id?`)

### Supported Types
campaign, session, character, npc, location, quest, faction, encounter, item, map, narrative_arc

### Split Pane Interface
- Left: Entity list with search
- Right: Entity editor form

## Admin Service API

### Entity CRUD
```javascript
import { createEntity, updateEntity, deleteEntity, fetchRawEntity } from '@/features/admin/api/adminService';

// Create - handles type-specific table routing
await createEntity(type, data);

// Update - routes to correct table based on type
await updateEntity(type, id, data);

// Delete
await deleteEntity(type, id);

// Fetch raw (bypasses views, gets direct table data)
await fetchRawEntity(type, id);
```

### Relationship Management
```javascript
import { addRelationship, deleteRelationship, updateRelationship, fetchRelationships } from '@/features/admin/api/adminService';

await addRelationship({ from_entity_id, to_entity_id, relationship_type, campaign_id });
await fetchRelationships(entityId);
await updateRelationship(relId, updates);
await deleteRelationship(relId);
```

### Child Row Operations
```javascript
import { upsertSessionEvent, upsertQuestObjective, upsertEncounterAction, fetchChildRows, deleteRow } from '@/features/admin/api/adminService';

// Session events
await upsertSessionEvent(eventData);

// Quest objectives
await upsertQuestObjective(objectiveData);

// Encounter actions
await upsertEncounterAction(actionData);

// Generic child row fetch
await fetchChildRows(table, foreignKeyCol, parentId, orderBy);

// Generic row delete
await deleteRow(table, id);
```

### Bulk Replace
```javascript
import { getBulkReplacePreview, executeBulkReplace } from '@/features/admin/api/adminService';

// Preview matches
const preview = await getBulkReplacePreview(campaignId, findTerm, replaceTerm);

// Execute replacements
await executeBulkReplace(changeList);
```

### Search
```javascript
import { searchEntitiesByName } from '@/features/admin/api/adminService';

const results = await searchEntitiesByName(campaignId, query);
```

## Development Scripts

### Schema Fetching
```bash
node src/dev_helpers/fetch-schema.js
```
Dumps complete DB schema to `src/dev_helpers/outputs/schema_dump.txt`.

### Encounter Narrative Generation
```bash
node src/dev_helpers/generate-all-encounter-narratives.js
```
Generates AI narratives for encounters with batch processing.

## Best Practices

### Data Safety
- Test changes on a single entity first
- Use bulk replace preview before executing
- Verify changes in the public app after editing

### Content Editing
- Use markdown for rich formatting
- Entity names are auto-linked by the smart-text system
- Preview content before saving
- Add aliases in attributes for alternate name matching
