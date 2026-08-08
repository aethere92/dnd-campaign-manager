-- ============================================================
-- Fix bidirectional relationship sync
-- 
-- Replaces create_reverse_relationship() to handle INSERT, UPDATE, DELETE
-- Uses session variable to prevent recursion on UPDATE/DELETE
-- Preserves original INSERT existence-check pattern
-- ============================================================

CREATE OR REPLACE FUNCTION create_reverse_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- Recursion guard for UPDATE and DELETE
  IF current_setting('app.syncing_relationship', true) = 'true' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  -- === DELETE ===
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_bidirectional = true THEN
      PERFORM set_config('app.syncing_relationship', 'true', true);
      DELETE FROM entity_relationships
      WHERE from_entity_id = OLD.to_entity_id
        AND to_entity_id = OLD.from_entity_id
        AND is_bidirectional = true;
      PERFORM set_config('app.syncing_relationship', 'false', true);
    END IF;
    RETURN OLD;
  END IF;

  -- === INSERT (original logic preserved) ===
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_bidirectional = true THEN
      IF NOT EXISTS (
        SELECT 1 FROM entity_relationships
        WHERE from_entity_id = NEW.to_entity_id
          AND to_entity_id = NEW.from_entity_id
          AND relationship_type = NEW.relationship_type
      ) THEN
        INSERT INTO entity_relationships (
          from_entity_id, to_entity_id, relationship_type,
          description, is_bidirectional, is_hidden
        ) VALUES (
          NEW.to_entity_id, NEW.from_entity_id, NEW.relationship_type,
          NEW.description, NEW.is_bidirectional, NEW.is_hidden
        );
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- === UPDATE ===
  IF TG_OP = 'UPDATE' THEN
    PERFORM set_config('app.syncing_relationship', 'true', true);

    -- Was bidirectional, still bidirectional → sync the mirror
    IF OLD.is_bidirectional = true AND NEW.is_bidirectional = true THEN
      UPDATE entity_relationships
      SET relationship_type = NEW.relationship_type,
          is_hidden = NEW.is_hidden,
          description = NEW.description
      WHERE from_entity_id = OLD.to_entity_id
        AND to_entity_id = OLD.from_entity_id
        AND is_bidirectional = true;

    -- Was bidirectional, now unidirectional → delete the mirror
    ELSIF OLD.is_bidirectional = true AND NEW.is_bidirectional = false THEN
      DELETE FROM entity_relationships
      WHERE from_entity_id = OLD.to_entity_id
        AND to_entity_id = OLD.from_entity_id
        AND is_bidirectional = true;

    -- Was unidirectional, now bidirectional → create the mirror
    ELSIF OLD.is_bidirectional = false AND NEW.is_bidirectional = true THEN
      IF NOT EXISTS (
        SELECT 1 FROM entity_relationships
        WHERE from_entity_id = NEW.to_entity_id
          AND to_entity_id = NEW.from_entity_id
          AND relationship_type = NEW.relationship_type
      ) THEN
        INSERT INTO entity_relationships (
          from_entity_id, to_entity_id, relationship_type,
          description, is_bidirectional, is_hidden
        ) VALUES (
          NEW.to_entity_id, NEW.from_entity_id, NEW.relationship_type,
          NEW.description, true, NEW.is_hidden
        );
      END IF;
    END IF;

    PERFORM set_config('app.syncing_relationship', 'false', true);
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the trigger to fire on all three operations
DROP TRIGGER IF EXISTS create_bidirectional_relationship ON entity_relationships;
CREATE TRIGGER create_bidirectional_relationship
  AFTER INSERT OR UPDATE OR DELETE ON entity_relationships
  FOR EACH ROW
  EXECUTE FUNCTION create_reverse_relationship();
