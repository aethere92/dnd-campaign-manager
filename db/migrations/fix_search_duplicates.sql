-- Fix: api_search_entities returns duplicate sessions
-- Sessions exist in both `entities` (via sync trigger) and `sessions` tables,
-- so UNION ALL returns them twice. Exclude session-type rows from the entities
-- query since the sessions query already covers them.
--
-- NOTE: entities.id and sessions.id are uuid, so return type must match.

DROP FUNCTION IF EXISTS api_search_entities(uuid, text);

CREATE OR REPLACE FUNCTION api_search_entities(p_campaign_id uuid, p_search_term text)
RETURNS TABLE(id uuid, name text, type text, description text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Search generic Entities (exclude sessions, they come from the sessions query below)
  SELECT e.id, e.name, e.type, e.description
  FROM entities e
  WHERE e.campaign_id = p_campaign_id
    AND e.type != 'session'
    AND (e.name ILIKE '%' || p_search_term || '%')

  UNION ALL

  -- Search Sessions (normalized)
  SELECT s.id, s.title as name, 'session'::text as type, s.narrative as description
  FROM sessions s
  WHERE s.campaign_id = p_campaign_id
    AND (s.title ILIKE '%' || p_search_term || '%')

  LIMIT 20;
END;
$$;
