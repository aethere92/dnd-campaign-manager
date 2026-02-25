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
  content         TEXT,
  metadata        JSONB,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entities_campaign ON entities(campaign_id);
CREATE INDEX idx_entities_type ON entities(campaign_id, type);
CREATE INDEX idx_entities_name ON entities(name);
```

### entity_relationships
Tracks connections between entities.

```sql
CREATE TABLE entity_relationships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     TEXT NOT NULL,
  source_id       TEXT NOT NULL,
  target_id       TEXT NOT NULL,
  relationship    TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relationships_source ON entity_relationships(source_id);
CREATE INDEX idx_relationships_target ON entity_relationships(target_id);
CREATE INDEX idx_relationships_campaign ON entity_relationships(campaign_id);
```

### campaigns
Campaign metadata and configuration.

```sql
CREATE TABLE campaigns (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

## Metadata Schemas

### Session Metadata
```json
{
  "session_number": 1,
  "date": "2024-01-15",
  "duration_hours": 4,
  "location": "loc_brindol",
  "participants": ["char_kaedin", "char_soshi"]
}
```
