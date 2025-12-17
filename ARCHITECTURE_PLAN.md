# Next.js To-Do List App - Architecture & Implementation Plan

## Project Architecture

### Folder Structure

```
DESAFIO_NEXT.JS/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (main to-do list)
│   ├── globals.css              # Global styles
│   └── api/                     # API routes (if needed)
│       └── tasks/               # Task-related API endpoints
│           └── route.ts         # Optional: server actions alternative
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Checkbox.tsx
│   ├── TaskList.tsx             # Main task list container
│   ├── TaskItem.tsx             # Individual task component
│   ├── TaskForm.tsx             # Add/Edit task form
│   └── UserProfile.tsx          # User identifier component
│
├── lib/                          # Utilities and configurations
│   ├── supabase/
│   │   ├── client.ts            # Supabase client (browser)
│   │   └── server.ts            # Supabase client (server)
│   └── utils.ts                 # Helper functions
│
├── types/                        # TypeScript type definitions
│   └── database.ts              # Database types (generated from Supabase)
│
├── hooks/                        # Custom React hooks
│   └── useTasks.ts              # Task CRUD operations hook
│
├── public/                       # Static assets
│
├── .env.local                    # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.js
```

### Component Hierarchy & Data Flow

```
App (page.tsx)
├── UserProfile (user identifier)
└── TaskList
    ├── TaskForm (add new task)
    └── TaskItem[] (list of tasks)
        └── TaskForm (edit mode)
```

**Data Flow:**
1. **Read**: `useTasks` hook → Supabase client → Supabase DB → React state → UI
2. **Create**: TaskForm → `useTasks.createTask()` → Supabase → Optimistic update → Re-fetch
3. **Update**: TaskItem → `useTasks.updateTask()` → Supabase → Optimistic update → Re-fetch
4. **Delete**: TaskItem → `useTasks.deleteTask()` → Supabase → Optimistic update → Re-fetch

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Modules or Tailwind CSS (recommended for clean UI)
- **State Management**: React hooks (useState, useEffect) + custom hooks
- **Data Fetching**: Supabase JS client with real-time subscriptions (optional for Phase 1)

---

## Supabase Table Schema

### Table: `tasks`

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,           -- User name or email
  title TEXT NOT NULL,                     -- Task title
  description TEXT,                        -- Optional task description
  completed BOOLEAN DEFAULT FALSE,         -- Completion status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX idx_tasks_user_identifier ON tasks(user_identifier);

-- Index for filtering completed tasks
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid()::text = user_identifier OR true);  -- Simplified for Phase 1

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);  -- Simplified for Phase 1

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (true);  -- Simplified for Phase 1

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (true);  -- Simplified for Phase 1
```

**Note**: For Phase 1, RLS policies are simplified. In production, you'd use proper authentication and match `auth.uid()` with user records.

---

## Implementation Steps for Phase 1

### Step 1: Project Setup
1. Initialize Next.js project with TypeScript and App Router
2. Install dependencies:
   - `@supabase/supabase-js`
   - `@supabase/ssr` (for server-side rendering support)
   - Optional: `tailwindcss` for styling
3. Configure environment variables (`.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Supabase Configuration
1. Create Supabase project
2. Run SQL schema (create `tasks` table, indexes, triggers, RLS policies)
3. Test connection from Next.js app

### Step 3: Supabase Client Setup
1. Create `lib/supabase/client.ts` (browser client)
2. Create `lib/supabase/server.ts` (server client for SSR)
3. Create TypeScript types from Supabase schema (or manually define)

### Step 4: Core Components - UI Layer
1. **UserProfile Component**
   - Input field for user identifier (name/email)
   - Store in React state or localStorage (temporary, until Supabase auth)
   - Display current user identifier

2. **TaskForm Component**
   - Input for task title
   - Optional: textarea for description
   - Submit button
   - Props: `onSubmit`, `initialData` (for edit mode), `onCancel` (for edit mode)

3. **TaskItem Component**
   - Display task title and description
   - Checkbox for completion status
   - Edit button
   - Delete button
   - Props: `task`, `onToggle`, `onEdit`, `onDelete`

4. **TaskList Component**
   - Container for TaskForm and TaskItem list
   - Handle task state management
   - Filter/sort logic (optional for Phase 1)

### Step 5: Data Layer - Custom Hook
1. **useTasks Hook** (`hooks/useTasks.ts`)
   - State: `tasks[]`, `loading`, `error`
   - Functions:
     - `fetchTasks(userIdentifier)` - Fetch all tasks for user
     - `createTask(task)` - Create new task
     - `updateTask(id, updates)` - Update task (title, description, completed)
     - `deleteTask(id)` - Delete task
   - Use Supabase client for all operations
   - Handle loading and error states

### Step 6: Main Page Integration
1. **app/page.tsx**
   - Import UserProfile, TaskList components
   - Manage user identifier state
   - Pass user identifier to TaskList/useTasks
   - Handle initial load and user changes

### Step 7: Styling & UX
1. Apply clean, modern UI styling
2. Add loading states (skeletons or spinners)
3. Add error handling and user feedback
4. Add optimistic updates for better UX
5. Responsive design (mobile-friendly)

### Step 8: Testing & Refinement
1. Test all CRUD operations
2. Test with different user identifiers
3. Verify data persistence in Supabase dashboard
4. Test error scenarios (network issues, invalid data)
5. Polish UI/UX

---

## Phase 2 Preview (Do NOT Implement)

### Future Architecture Additions:
- `app/chat/page.tsx` - Chatbot interface
- `components/ChatInterface.tsx` - Chat UI component
- `lib/n8n/` - Webhook integration utilities
- `app/api/webhooks/n8n/route.ts` - Webhook endpoint
- AI service integration for task title enhancement

### Future Database Changes:
- Add `ai_enhanced_title` column to `tasks` table
- Add `enhancement_history` JSONB column (optional)

---

## Key Design Decisions

1. **No localStorage**: All data persisted in Supabase only
2. **User Identifier**: Simple text field (name/email) for Phase 1, no full auth
3. **Real-time Updates**: Optional for Phase 1 (can use polling or manual refresh)
4. **Server Actions vs API Routes**: Prefer Server Actions for better DX, but API routes work too
5. **State Management**: React hooks sufficient for Phase 1, no Redux/Zustand needed
6. **Error Handling**: Try-catch in hooks + user-friendly error messages

---

## Environment Variables Template

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

This architecture provides a clean separation of concerns, scalable structure, and sets up a solid foundation for Phase 2 integration.

