---
inclusion: fileMatch
fileMatchPattern: "**/admin/**"
---

# Admin Console Guide

## Overview
The admin console (`/dm/*` routes) provides a comprehensive interface for managing campaign content. It's only available in development mode (`import.meta.env.DEV`).

## Access
Navigate to `/dm` in development mode to access the admin console.

## Features

### 1. Entity Management (`/dm/manage/:type/:id?`)

#### Split Pane Interface
The main management interface uses a split-pane layout:
- **Left Pane**: List of entities with search and filters
- **Right Pane**: Entity editor form

#### Supported Entity Types
- campaign
- session
- character
- npc
- location
- quest
- faction
- encounter
- item

#### Entity Editor
The editor provides:
- **Basic Fields**: Name, description, type
- **Content Editor**: Rich text editor with markdown support
- **Metadata Editor**: JSON editor for type-specific data
- **Image Management**: Upload and assign images
- **Relationship Manager**: Create and manage entity relationships
- **Preview**: Live preview of entity rendering

#### Relationship Manager
Create relationships between entities:
```javascript
<RelationshipManager
  campaignId={campaignId}
  entityId={entityId}
  onUpdate={handleRelationshipsUpdate}
/>
```

Features:
- Search and select target entities
- Choose relationship type (ally, enemy, member, etc.)
- Add relationship metadata
- View and delete existing relationships
- Bidirectional relationship support

### 2. Bulk Replace Tool (`/dm/tools/replace`)

#### Purpose
Find and replace text across all entities in a campaign.

#### Use Cases
- Fix typos across multiple entities
- Update entity references after renaming
- Standardize terminology
- Update formatting patterns

#### Features
- **Campaign Selection**: Choose target campaign
- **Entity Type Filter**: Limit to specific entity types
- **Field Selection**: Search in name, description, content, or metadata
- **Preview**: See matches before applying changes
- **Dry Run**: Test replacements without committing
- **Regex Support**: Use regular expressions for complex patterns

#### Safety Features
- Confirmation dialog before applying changes
- Backup recommendation before bulk operations
- Transaction support for atomic updates
- Rollback capability

### 3. Map Migration Tool (`/dm/tools/migration`)

#### Purpose
Migrate map data between campaigns or update map structures.

#### Features
- **Schema Updates**: Update map data structure
- **Campaign Migration**: Copy maps between campaigns
- **Coordinate Conversion**: Convert between coordinate systems
- **Marker Migration**: Update marker data format
- **Validation**: Check map data integrity

### 4. Map Manager (`/dm/tools/atlas`)

#### Purpose
Visual interface for managing campaign maps.

#### Features
- **Map Upload**: Upload new map images
- **Marker Editor**: Add/edit/delete map markers
- **Layer Management**: Manage map layers and overlays
- **Coordinate Tools**: Get coordinates by clicking
- **Preview**: Live preview of map changes

## Development Scripts

### Schema Fetching
Dump the complete database schema:
```bash
node src/dev_helpers/fetch-schema.js
```

Output: `src/dev_helpers/outputs/schema_dump.txt`

Includes:
- Table structures with columns and types
- Sample data (truncated to 100 words)
- Indexes and performance info
- RLS policies
- Views and functions
- Triggers

### Encounter Narrative Generation
Generate AI narratives for encounters:
```bash
node src/dev_helpers/generate-all-encounter-narratives.js
```

Features:
- Fetches encounter data from database
- Generates narrative descriptions using AI
- Updates encounter content field
- Batch processing with rate limiting

### Schema API Fetching
Fetch schema via Supabase API:
```bash
node src/dev_helpers/fetch-schema-api.js
```

Alternative to direct database connection using Supabase REST API.

## Admin Components

### EntityForm
Main form component for entity editing:
```javascript
<EntityForm
  entity={entity}
  campaignId={campaignId}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

### EntityList
Filterable list of entities:
```javascript
<EntityList
  entities={entities}
  selectedId={selectedId}
  onSelect={handleSelect}
  onDelete={handleDelete}
/>
```

### MetadataEditor
JSON editor for entity metadata:
```javascript
<MetadataEditor
  metadata={entity.metadata}
  onChange={handleMetadataChange}
  schema={metadataSchema}
/>
```

### ImageUploader
Image upload and management:
```javascript
<ImageUploader
  campaignId={campaignId}
  entityId={entityId}
  entityType={entityType}
  variant="portrait"
  onUpload={handleImageUpload}
/>
```

## API Functions

### Entity CRUD
```javascript
// Create
await createEntity(campaignId, entityData);

// Read
const entity = await fetchEntity(campaignId, entityId);
const entities = await fetchEntities(campaignId, type);

// Update
await updateEntity(campaignId, entityId, updates);

// Delete
await deleteEntity(campaignId, entityId);
```

### Relationship Management
```javascript
// Create relationship
await createRelationship(campaignId, {
  source_id: entityId,
  target_id: targetId,
  relationship: 'ally',
  metadata: {}
});

// Fetch relationships
const relationships = await fetchRelationships(campaignId, entityId);

// Delete relationship
await deleteRelationship(relationshipId);
```

### Bulk Operations
```javascript
// Bulk replace
await bulkReplace(campaignId, {
  entityTypes: ['npc', 'location'],
  fields: ['content'],
  find: 'old text',
  replace: 'new text',
  useRegex: false
});

// Bulk update
await bulkUpdate(campaignId, entityIds, updates);
```

## Best Practices

### Data Safety
- Always backup before bulk operations
- Test changes on a single entity first
- Use dry run mode when available
- Verify changes in the UI before committing

### Performance
- Limit bulk operations to necessary entity types
- Use specific field filters to reduce processing
- Process large batches in chunks
- Monitor database performance during operations

### Workflow
1. **Plan**: Identify what needs to change
2. **Test**: Try on a single entity or use dry run
3. **Backup**: Export or backup affected data
4. **Execute**: Run the operation
5. **Verify**: Check results in the UI
6. **Rollback**: Revert if issues found

### Entity Relationships
- Create relationships from both directions when needed
- Use appropriate relationship types
- Add metadata to provide context
- Clean up orphaned relationships

### Content Editing
- Use markdown for rich formatting
- Link entities with `[[entity_id]]` syntax
- Preview content before saving
- Validate entity links exist

## Troubleshooting

### Common Issues

**Entity not appearing in list:**
- Check campaign_id matches current campaign
- Verify entity type is correct
- Check for database errors in console

**Relationship not showing:**
- Verify both entities exist
- Check relationship direction
- Ensure campaign_id is set correctly

**Bulk replace not working:**
- Check regex syntax if using regex mode
- Verify field selection includes target content
- Check for special characters that need escaping

**Image upload failing:**
- Check file size (max 5MB recommended)
- Verify file format (WebP preferred)
- Check storage permissions
- Ensure correct naming convention

### Debug Tools
- Browser DevTools console for errors
- Network tab for API calls
- React DevTools for component state
- Supabase dashboard for database queries
