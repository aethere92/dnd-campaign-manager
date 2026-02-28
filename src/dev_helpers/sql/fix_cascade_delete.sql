-- ============================================================
-- Fix cascade delete: clean up relationships when entity deleted
-- 
-- Modifies sync_to_entities() to delete relationship rows
-- BEFORE deleting from entities table on DELETE operations.
-- The bidirectional trigger (create_reverse_relationship) will
-- automatically handle mirror cleanup for each deleted row.
--
-- No new functions or triggers needed — extends existing function.
-- ============================================================

CREATE OR REPLACE FUNCTION sync_to_entities()
RETURNS TRIGGER AS $$
DECLARE
  entity_type text := TG_ARGV[0];
  entity_name text;
  entity_desc text;
BEGIN
  -- 1. Determine Name and Description based on table type
  IF entity_type = 'quest' OR entity_type = 'narrative_arc' THEN
    entity_name := NEW.title;         
    entity_desc := NEW.description;
  ELSIF entity_type = 'character' THEN
    entity_name := NEW.name;
    entity_desc := NEW.description;
  ELSIF entity_type = 'session' THEN
    entity_name := NEW.title;
    entity_desc := null;
  ELSE
    entity_name := NEW.name;
    entity_desc := NEW.description;  
  END IF;

  -- 2. Perform the Sync
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.entities (id, campaign_id, type, name, description)
    VALUES (NEW.id, NEW.campaign_id, entity_type, entity_name, entity_desc)
    ON CONFLICT (id) DO UPDATE 
    SET 
      name = EXCLUDED.name,
      description = EXCLUDED.description;
      
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.entities 
    SET 
      name = entity_name,
      description = entity_desc
    WHERE id = NEW.id;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Clean up all relationships involving this entity.
    -- The bidirectional trigger (create_reverse_relationship) will
    -- automatically delete mirror rows for any bidirectional relationships.
    DELETE FROM public.entity_relationships
    WHERE from_entity_id = OLD.id OR to_entity_id = OLD.id;

    -- Then remove from entities table
    DELETE FROM public.entities WHERE id = OLD.id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
