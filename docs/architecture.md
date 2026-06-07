# YuktiCanvas Collaborative Architecture

This document describes the production-ready collaboration architecture built using Supabase, React, and real-time multiplayer cursor synchronization.

## 1. Database Schema

The collaboration data model exists in `docs/database_schema.sql` and includes:
- **`projects`**: The core board data containing shapes and viewport state.
- **`project_members`**: Manages granular roles (Owner, Editor, Viewer).
- **`invitations`**: Tracks pending invites sent via email to collaborators.
- **`notifications`**: Stores system/user alerts.
- **`activities`**: Event sourcing for tracking interactions (create, edit, delete, group).

## 2. Realtime Synchronization (`src/lib/realtime.ts`)

Instead of standard polling, we utilize **Supabase Realtime** capabilities with high-frequency telemetry.
We spin up a dedicated `Supabase Channel` per board room: `board:${boardId}`.

### Broadcasting vs. Database Sync
- **Cursor Telemetry**: Uses `broadcast` to stream low-latency X/Y coordinates without impacting the database.
- **Presence**: Uses `track` and `sync` to maintain an active registry of users along with their selection states.
- **Board Updates**: Transmitted via `broadcast` for immediate multi-client application. Note that for conflict resolution, a true enterprise version would merge CRDT states powered by Yjs.

## 3. UI/UX

- **ShareModal**: Designed to invite users through direct input, modify their ACL role dynamically, and generate public quick links.
- **NotificationCenter**: Centralized slide-down or pop-over overlay handling pending requests.
- **Avatar Stacking**: Visually stacks participants in the board header dynamically, indicating active editors with collision detection and hover labels.
- **Live Cursors**: The SVG renders active remote pointers transformed locally through affine matrix scaling to maintain context irrespective of different users' varied viewport scaling/zooming layers.

## 4. Security (RLS)

Postgres Row Level Security handles access control. 
Only authenticated participants explicitly named within the `project_members` ledger or public via accepted link logic can read or modify.
`getBoard()` strictly falls back into Mock-local state if disconnected, but blocks unauthenticated access through Supabase.
