## Backend & Data Architecture

### 1. Database Schema (Supabase)
We need a table named `leads`.
Columns:
- `id`: uuid (Primary Key)
- `created_at`: timestamp
- `phone`: text (Unique, indexed)
- `name`: text
- `form_data`: jsonb (Stores the entire wizard payload: goal, days, equipment, etc.)
- `plan_id`: text (Short unique ID like '8x92a' for the URL)

### 2. API Endpoint (`src/pages/api/submit.ts`)
- Accepts POST request from the Wizard.
- Validates data.
- Inserts into Supabase `leads` table.
- Generates a short ID.
- Returns `{ success: true, redirectUrl: /plan/8x92a }`.

### 3. Dynamic Results Page (`src/pages/plan/[id].astro`)
- Fetches data from Supabase using the `id` from the URL.
- **Render Strategy:** Since we are waiting for the client's specific video links, use a **Placeholder Logic Map**.
    - Create a `contentMap.ts` file.
    - If `goal === 'Fat Loss'`, return a placeholder title "Fat Loss Protocol" and a placeholder YouTube link.
    - If `location === 'Gym'`, return a list of gym exercises.