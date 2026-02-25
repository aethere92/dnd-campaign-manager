---
inclusion: always
---

# D&D Campaign Manager - Project Overview

## Purpose
A comprehensive web-based tool for managing and viewing Dungeons & Dragons campaigns. Features interactive maps, session recaps, character profiles, quest logs, and a rich wiki system for tracking NPCs, locations, factions, and items.

## Tech Stack

### Core
- **React 19** with React Router for navigation
- **Vite** for build tooling and development
- **TanStack Query** for data fetching and caching (aggressive caching: 1hr stale time, 24hr cache)
- **Supabase** for backend database and API
- **Tailwind CSS 4** for styling

### Key Libraries
- **Leaflet** + react-leaflet for interactive maps
- **Cytoscape** for relationship graphs
- **React Markdown** for content rendering
- **React Hook Form** for form management
- **Lucide React** for icons
- **Vaul** for drawer components

## Architecture

### Feature-Based Structure
```
src/
├── app/              # App initialization, routing, global styles
├── domain/           # Core business logic and entity definitions
├── features/         # Feature modules (self-contained)
│   ├── admin/        # Admin console (dev only)
│   ├── atlas/        # Interactive maps
│   ├── campaign/     # Campaign selection and context
│   ├── dashboard/    # Main dashboard
│   ├── graph/        # Relationship visualization
│   ├── navigation/   # Main layout and navigation
│   ├── search/       # Global search
│   ├── smart-text/   # Entity linking in markdown
│   ├── smart-tooltip/# Hover tooltips for entities
│   ├── table-of-contents/ # Auto-generated TOC
│   ├── timeline/     # Timeline view
│   └── wiki/         # Entity wiki pages
├── shared/           # Shared utilities, components, hooks
└── dev_helpers/      # Development scripts
```

### Feature Module Pattern
Each feature follows this structure:
```
feature/
├── api/              # Data fetching functions
├── components/       # Feature-specific components
├── config/           # Configuration and constants
├── hooks/            # Custom hooks
├── pages/            # Page components
├── utils/            # Utility functions
└── [FeatureName].jsx # Main feature component
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

### Campaign Context
- Campaign selection persists in localStorage
- Campaign ID drives all data queries
- Cache invalidation on campaign change

### Smart Text System
- Markdown content with entity linking via `[[entity_id]]` syntax
- Automatic tooltip generation on hover
- Entity index for fast lookups

### Image Management
- Images organized by campaign: `public/images/{campaign_id}/{type}/`
- Manifest generation script for image discovery
- WebP format for optimization

## Routing

### Public Routes
- `/select-campaign` - Campaign selection screen
- `/` - Dashboard (requires campaign)
- `/atlas/:mapId` - Interactive map viewer
- `/timeline` - Timeline view
- `/relationships` - Relationship graph
- `/wiki/:type` - Entity wiki landing
- `/wiki/:type/:entityId` - Entity detail page

### Admin Routes (dev only)
- `/dm/manage/:type/:id?` - Entity CRUD interface
- `/dm/tools/replace` - Bulk text replacement
- `/dm/tools/migration` - Data migration tools
- `/dm/tools/atlas` - Map management

## Data Flow

1. **Campaign Selection** → Stored in localStorage + Context
2. **Data Fetching** → TanStack Query with Supabase client
3. **Entity Linking** → Smart text parser + Entity index
4. **Tooltips** → Hover detection + Portal rendering
5. **Navigation** → React Router + URL state

## Environment Variables
```
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Public anon key
DATABASE_URL               # Direct DB connection (dev scripts)
SUPABASE_SERVICE_ROLE_KEY  # Admin key (dev scripts)
```

## Development Scripts
- `npm run dev` - Start dev server (generates image manifest first)
- `npm run build` - Production build
- `node src/dev_helpers/fetch-schema.js` - Dump database schema
- `node src/dev_helpers/generate-all-encounter-narratives.js` - Generate AI narratives

## Key Patterns

### Aggressive Caching
- 1 hour stale time for all queries
- 24 hour cache retention
- No refetch on window focus or mount
- Manual invalidation on campaign change

### Error Boundaries
- Top-level error boundary wraps entire app
- Graceful error handling with user-friendly messages

### Lazy Loading
- All route components lazy loaded
- Suspense boundaries with loading states

### Theme System
- CSS custom properties for theming
- Background texture overlay
- Responsive design patterns
