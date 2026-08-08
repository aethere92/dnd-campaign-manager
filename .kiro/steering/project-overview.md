---
inclusion: always
---

# D&D Campaign Manager - Project Overview

## Purpose

A comprehensive web-based tool for managing and viewing Dungeons & Dragons campaigns. Features interactive maps, session recaps, character profiles, quest logs, and a rich wiki system for tracking NPCs, locations, factions, and items.

## Tech Stack

### Core

- **React 19** with React Router v7 for navigation
- **Vite 7** for build tooling and development
- **TanStack Query v5** for data fetching and caching (aggressive caching: 30min–1hr stale time, 24hr cache)
- **Supabase** for backend database and API (uses optimized DB views)
- **Tailwind CSS 4** with `@tailwindcss/vite` plugin

### Key Libraries

- **Leaflet** + react-leaflet for interactive maps
- **Cytoscape** + cytoscape-fcose for relationship graphs
- **React Markdown** for content rendering
- **React Hook Form** for form management
- **Lucide React** for icons
- **Vaul** for drawer components
- **clsx** + **tailwind-merge** for conditional class composition

## Architecture

### Feature-Based Structure

```
src/
├── app/              # App initialization, routing, global styles
│   ├── components/   # RouteLoading
│   ├── styles/       # global.css
│   ├── App.jsx
│   └── AppRoutes.jsx
├── domain/           # Core business logic
│   └── entity/       # Entity config, API, components, utils
├── features/         # Feature modules (self-contained)
│   ├── admin/        # Admin console (dev only)
│   ├── atlas/        # Interactive maps (Leaflet)
│   ├── campaign/     # Campaign selection and context
│   ├── dashboard/    # Main dashboard
│   ├── graph/        # Relationship visualization (Cytoscape)
│   ├── navigation/   # Main layout and sidebar nav
│   ├── search/       # Global search with context
│   ├── smart-text/   # Automatic entity linking in markdown
│   ├── smart-tooltip/# Hover tooltips with entity profiles
│   ├── table-of-contents/ # Auto-generated TOC from headings
│   ├── timeline/     # Timeline view
│   └── wiki/         # Entity wiki pages with layouts
├── shared/           # Shared utilities, components, hooks
│   ├── api/          # supabaseClient.js
│   ├── components/   # ErrorBoundary, layout/, markdown/, ui/
│   ├── hooks/        # useBreadcrumbs, useTheme
│   └── utils/        # imageUtils, markdownUtils, textUtils, theme/
├── dev_helpers/      # Development scripts
└── main.jsx
```

## Core Concepts

### Entity System

All content is organized as entities with types:

- **session** - Game sessions with narrative content
- **character** - Player characters
- **npc** - Non-player characters
- **location** - Places in the world
- **quest** - Objectives and missions
- **faction** - Organizations and groups
- **encounter** - Combat encounters
- **item** - Magic items and equipment

Entity configuration is modular, split across:

- `entityTypes.js` - Type constants and labels
- `entityIcons.js` - Lucide icon mappings
- `entityColors.js` - Hex color palettes (50–900 shades)
- `entityStyles.js` - Tailwind class presets
- `entityConfig.js` - Unified `getEntityConfig()` orchestrator

### Campaign Context

- Campaign selection persists in localStorage (fallback: sessionStorage)
- `CampaignProvider` exposes: `campaignId`, `setCampaignId`, `campaignRow` (DB metadata), `campaignData` (resolved JS config), `isLoading`
- Campaign ID drives all data queries
- Cache invalidation on campaign change

### Smart Text System

- Automatic entity name matching using word boundaries (`\b`) — not just `[[id]]` syntax
- Matches entity names AND aliases (case-insensitive)
- Longest-match-first to prevent partial matches (e.g., "Captain Soranna" before "Soranna")
- Converts matches to markdown links: `[text](#entity/id/type)`
- Protects existing markdown links from re-processing
- Entity index structure: `{ list, map (Map), searchTokens }`

### Image Management

- Images organized by campaign: `public/images/{campaign_id}/{type}/`
- Manifest generation script: `scripts/generate-image-manifest.js`
- WebP format for optimization
- Image variants: icon, portrait, header, map

## Routing

### Public Routes

- `/select-campaign` - Campaign selection screen
- `/` - Dashboard (requires campaign)
- `/atlas/:mapId` - Interactive map viewer
- `/atlas` - Redirects to `/atlas/world_map`
- `/timeline` - Timeline view
- `/relationships` - Relationship graph
- `/wiki/:type` - Entity wiki landing (WikiLayout wraps both)
- `/wiki/:type/:entityId` - Entity detail page

### Admin Routes (dev only)

- `/dm` - Redirects to `/dm/manage/campaign`
- `/dm/manage/:type/:id?` - Entity CRUD (split-pane editor)
- `/dm/tools/replace` - Bulk text find & replace
- `/dm/tools/migration` - Map data migration
- `/dm/tools/atlas` - Visual map manager

## Data Flow

1. **Campaign Selection** → localStorage + CampaignContext
2. **Data Fetching** → TanStack Query with Supabase views (strategy pattern per entity type)
3. **Entity Linking** → useSmartText processes text → word boundary matching → markdown link injection
4. **Tooltips** → TooltipContext + TooltipContainer portal → entity-specific profiles (HP, status, personality)
5. **Navigation** → React Router + sidebar nav (3 sections: Overview, World, Wiki)

## Supabase Views (Optimization Layer)

The app uses pre-aggregated database views instead of raw table queries:

- `view_campaign_timeline` - Pre-aggregated session data with events and tags
- `entity_complete_view` - Full entity details with relationships
- `view_campaign_graph` - Graph nodes with adjacency lists
- `view_entity_index` - Lightweight index (id, name, type, icon, status, affinity, aliases)
- `view_narrative_arc_summary` - Arc organization for session grouping
- `view_encounter_actions_hydrated` - Encounter round/action details

## Environment Variables

```
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Public anon key
DATABASE_URL               # Direct DB connection (dev scripts)
SUPABASE_SERVICE_ROLE_KEY  # Admin key (dev scripts)
```

## Development Scripts

- `npm run dev` - Generates image manifest, then starts Vite dev server
- `npm run build` - Generates image manifest, then production build
- `node src/dev_helpers/fetch-schema.js` - Dump database schema
- `node src/dev_helpers/generate-all-encounter-narratives.js` - Generate AI narratives

## Key Patterns

### Aggressive Caching

- 30 min stale time for entity index, 1 hour for most queries
- 24 hour cache retention
- No refetch on window focus or mount
- Manual invalidation on campaign change

### Error Handling

- Top-level ErrorBoundary wraps entire app
- Graceful degradation in tooltip system (returns dummy functions if context missing)
- Try-catch in entity service with error logging

### Lazy Loading

- All route components lazy loaded via `React.lazy()`
- Suspense boundaries with `RouteLoading` component

### Theme System

- Three themes: Dark, D&D (fantasy), and Light (commented out)
- `useTheme` hook with `cycleTheme()` for toggling
- CSS custom properties via `data-theme` attribute on `<html>`
- Background texture overlay via CSS variable
- Theme persisted in localStorage

### Wiki View Strategies

Entity wiki landing pages use different layout strategies:

- **geo** (location, encounter, npc) - Hierarchical swimlanes based on location tree
- **category** (faction, quest, session) - Grouped by category/arc
- **flat** (character, item) - Alphabetical flat list

### Wiki Detail Layouts

Entity detail pages use layout modes:

- **tabs** (session) - Tabbed layout with events, narrative
- **character** - Character-specific layout with stats
- **standard** - Default layout for all other types
