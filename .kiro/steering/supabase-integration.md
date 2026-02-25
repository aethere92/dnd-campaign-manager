---
inclusion: fileMatch
fileMatchPattern: "**/api/**"
---

# Supabase Integration Guide

## Client Setup

### Shared Client
Always use the shared Supabase client:
```javascript
import { supabase } from '@/shared/api/supabaseClient';
```

### Client Configuration
```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

## Query Patterns

### Fetch All Entities
```javascript
export const fetchEntities = async (campaignId, type) => {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('type', type)
    .order('name');
    
  if (error) throw error;
  return data;
};
```

### Fetch Single Entity
```javascript
export const fetchEntity = async (campaignId, entityId) => {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('id', entityId)
    .single();
    
  if (error) throw error;
  return data;
};
```

### Create Entity
```javascript
export const createEntity = async (campaignId, entityData) => {
  const { data, error } = await supabase
    .from('entities')
    .insert({
      id: entityData.id,
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

### Update Entity
```javascript
export const updateEntity = async (campaignId, entityId, updates) => {
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
