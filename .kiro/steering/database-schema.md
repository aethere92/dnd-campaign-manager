---
inclusion: manual
---

# Database Schema Reference

## Core Tables

### entities
Primary table for all campaign content.

```sql
CREATE TABLE entities (
  id              TEXT PRIMARY KEY,
  campaign_id     TEXT NOT NULL,
  type            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  attributes      JSONB,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entities_campaign ON entities(campaign_id);
CREATE INDEX idx_entities_type ON entities(campaign_id, type);
CREATE INDEX idx_entities_name ON entities(name);
```

### sessions
Session data (separate from entities table).

```sql
sessions (
  id              UUID PRIMARY KEY,
  campaign_id     TEXT NOT NULL,
  title           TEXT NOT NULL,
  narrative       TEXT,
  attributes      JSONB,    -- { session_number, session_date }
  created_at      TIMESTAMP DEFAULT NOW()
)
```

### entity_relationships
Tracks connections between entities.

```sql
CREATE TABLE entity_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_id    TEXT NOT NULL,
  to_entity_id      TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  description       TEXT,
  is_bidirectional  BOOLEAN DEFAULT FALSE,
  is_hidden         BOOLEAN DEFAULT FALSE,
  campaign_id       TEXT,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relationships_from ON entity_relationships(from_entity_id);
CREATE INDEX idx_relationships_to ON entity_relationships(to_entity_id);
```

#### Bidirectional Relationship Triggers
Function `create_reverse_relationship()` handles mirror row lifecycle on all operations:
- INSERT with `is_bidirectional: true` → creates B→A mirror (existence check prevents dupes)
- DELETE of bidirectional row → auto-deletes the mirror
- UPDATE:
  - Still bidirectional: syncs `relationship_type`, `is_hidden`, `description` to mirror
  - Toggled OFF: deletes the mirror
  - Toggled ON: creates the mirror
- Uses `app.syncing_relationship` session variable to prevent recursion on UPDATE/DELETE
- Unique constraint: `UNIQUE(from_entity_id, to_entity_id, relationship_type)`

**Trigger SQL source**: `src/dev_helpers/sql/fix_bidirectional_triggers.sql`

#### Cascade Delete via sync_to_entities()
When any entity source table row is deleted (characters, npcs, locations, etc.), the `sync_to_entities()` trigger:
1. Deletes ALL `entity_relationships` rows where `from_entity_id = OLD.id OR to_entity_id = OLD.id`
2. The bidirectional trigger (`create_reverse_relationship`) fires for each deleted row, cleaning up mirrors
3. Then deletes the row from `entities` table

This means entity deletion automatically cascades to relationship cleanup at the DB level. No client-side cleanup needed.

**Trigger SQL source**: `src/dev_helpers/sql/fix_cascade_delete.sql`

#### Relationship Data Model Rules
- Always check BOTH code and DB (triggers, views, functions) before making assumptions about data behavior
- The public-facing views (`entity_complete_view`, `view_campaign_graph`) resolve bidirectional relationships at the SQL level
- Client code should remain simple — the DB handles mirror row management
- Prefer fixing DB triggers/functions over adding compensating logic in client code

### campaigns
Campaign metadata and configuration.

```sql
CREATE TABLE campaigns (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  config          JSONB,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### maps
Map configuration per campaign.

```sql
CREATE TABLE maps (
  id              UUID PRIMARY KEY,
  campaign_id     TEXT NOT NULL,
  title           TEXT NOT NULL,
  key             TEXT NOT NULL,    -- URL slug
  config          JSONB,           -- { width, height, path, ... }
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### quest_objectives
Quest objective tracking.

```sql
quest_objectives (
  id              UUID PRIMARY KEY,
  quest_id        TEXT NOT NULL,
  description     TEXT,
  status          TEXT,
  session_id      UUID,            -- Links to session where completed
  order_index     INTEGER,
  created_at      TIMESTAMP DEFAULT NOW()
)
```

### encounter_actions
Combat encounter round actions.

```sql
encounter_actions (
  id              UUID PRIMARY KEY,
  encounter_id    TEXT NOT NULL,
  round_number    INTEGER,
  action_order    INTEGER,
  description     TEXT,
  actor           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
)
```

## Optimized Views

### view_entity_index
Lightweight view for smart-text matching and search:
- `id`, `name`, `type`, `description`, `campaign_id`
- `icon_url`, `status`, `affinity`, `background_image`, `aliases`

### entity_complete_view
Full entity data with pre-joined relationships:
- All entity columns + `relationships` as JSON array

### view_campaign_timeline
Pre-aggregated session data:
- `session_id`, `session_title`, `session_narrative`, `session_number`, `session_date`
- `events` as JSON array (each with `tags` containing linked entity info)

### view_campaign_graph
Graph-optimized view:
- Node data with adjacency list for Cytoscape rendering

### view_narrative_arc_summary
Arc metadata:
- `id`, `name`, `campaign_id`, `order`, `description`

### view_encounter_actions_hydrated
Encounter details:
- Action data with resolved actor names and metadata

## Attributes Field (JSONB)
Entity attributes are stored as JSONB and vary by type:

**Character/NPC**: race, class, level, alignment, status, affinity, personality, hit points, armor class, movement, gender, role, aliases
**Location**: type, parent_location, ruler, population, coordinates
**Quest**: quest type, status, priority
**Faction**: affinity, influence
**Session**: session_number, session_date
**Item/Encounter**: varies by content
