# Damin - Collaborative Dashboard

A collaborative dashboard application built with Next.js, TypeScript, and Supabase. Users can create and manage various widgets in a customizable grid layout, with real-time synchronization across sessions.

## Features

### Session Management
- Create new sessions or join existing ones using session code and password
- Secure session authentication
- Session-specific dashboard layouts
- Real-time collaboration across multiple users

### Dashboard with Widgets
- **Resizable Grid Layout**: Customizable dashboard using react-grid-layout
- **Three Widget Types**:
  - **Memo**: Note-taking widget for creating and managing memos
  - **Countdown**: Countdown timer widget
  - **Letters**: Text/letter management widget
- **Widget Management**: Add, remove, resize, and reposition widgets
- **Session-Specific Storage**: Each session maintains its own dashboard layout

### Full-Page Views
Each widget type has dedicated full-page views:
- `/memo` - Full memo management interface
- `/countdown` - Full countdown interface  
- `/letters` - Full letters interface

## Database Setup

### Required Tables

1. **sessions** table (existing):
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT UNIQUE NOT NULL,
  session_name TEXT,
  session_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **dashboard_layouts** table (new):
```sql
CREATE TABLE dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id)
);
```

### Migration
Run the SQL migration file `migrations/001_create_dashboard_layouts.sql` in your Supabase SQL editor.

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
npm install
npm run dev
```

## Key Changes for Session-Specific Layouts

### Before
- Dashboard layouts were stored globally in localStorage
- All sessions shared the same widget layout
- No real-time synchronization

### After
- Dashboard layouts are stored per session in Supabase
- Each session maintains its own unique widget layout
- Real-time synchronization across all users in the same session
- Automatic cleanup when switching sessions

### Technical Implementation

1. **Database Storage**: Created `dashboard_layouts` table with session-specific storage
2. **Real-time Sync**: Added Supabase real-time subscriptions for live updates
3. **Session Management**: Updated session switching to clear dashboard state
4. **Debounced Saving**: Implemented debounced saving to prevent excessive database calls

## Architecture

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, real-time subscriptions, authentication)
- **Widget System**: react-grid-layout for resizable, draggable widgets
- **State Management**: React hooks with session-specific persistence
