# Prompt: Add User Sign-Up & Build Ownership

## Context

This is a Next.js 16 (App Router) + Supabase project for tracking character builds in the game "Once Human". The codebase uses TypeScript, Tailwind CSS v4, and Radix UI components.

### Current Auth State
- Auth is handled via `components/auth-provider.tsx` using Supabase Auth
- Only admins (`user_metadata.is_admin = true`) can access `/admin/add`, `/admin/edit`, `/admin/delete`
- There is no public sign-up — admin accounts are created manually in the Supabase dashboard
- The `builds` table has NO `user_id` or owner column — all builds are unowned

### Current RLS Policies
- `SELECT`: Public (anyone can read all builds)
- `INSERT / UPDATE / DELETE`: Requires `auth.uid() IS NOT NULL` (any logged-in user)

### Key Files
- `components/auth-provider.tsx` — Auth context provider (`user`, `isAdmin`, `signOut`)
- `components/admin-login-modal.tsx` — Current admin-only login modal
- `app/admin/add/page.tsx` — Add build form
- `app/admin/edit/page.tsx` — Edit build form
- `app/admin/delete/page.tsx` — Delete build page
- `hooks/use-build-actions.ts` — Build CRUD mutations (add, edit, delete)
- `hooks/use-builds.ts` — Fetches and enriches all builds
- `lib/supabase.ts` — Supabase client singleton
- `lib/jit-insert.ts` — JIT master-data resolution for new items

### Database Tables Involved
- `builds` — Core build record (`id`, `build_name`, `calibration_id`)
- `build_gear` — Gear slot assignments (composite PK: `build_id`, `slot_name`)
- `build_cradle` — Cradle items (composite PK: `build_id`, `item_slot`)
- `build_ability_assignment` — Abilities (composite PK: `build_id`, `ability_rank`)

---

## Task

Implement user sign-up and build ownership so that:

### 1. Access Roles

| Role | View Builds | Create Builds | Edit Own Builds | Delete Own Builds | Edit/Delete Any Build |
|------|-------------|---------------|-----------------|-------------------|-----------------------|
| Unregistered (anonymous) | Yes | No | No | No | No |
| Registered (logged in) | Yes | Yes | Yes | Yes | No |
| Admin (`is_admin = true`) | Yes | Yes | Yes | Yes | Yes |

### 2. Database Changes (Run in Supabase SQL Editor)

Add a `user_id` column to the `builds` table:
```sql
ALTER TABLE builds ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

Update RLS policies on `builds`:
```sql
-- Drop existing INSERT/UPDATE/DELETE policies first, then:

-- Anyone can read
CREATE POLICY "Public read access" ON builds FOR SELECT USING (true);

-- Logged-in users can create builds (owned by them)
CREATE POLICY "Users can insert own builds" ON builds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own builds; admins can update any
CREATE POLICY "Users can update own builds" ON builds FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- Users can delete their own builds; admins can delete any
CREATE POLICY "Users can delete own builds" ON builds FOR DELETE
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
```

Apply matching RLS policies on `build_gear`, `build_cradle`, and `build_ability_assignment` that join back to `builds.user_id`:
```sql
-- Example for build_gear (repeat pattern for build_cradle and build_ability_assignment):
CREATE POLICY "Users can modify own build gear" ON build_gear FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_gear.build_id
      AND (builds.user_id = auth.uid()
           OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true)
    )
  );
```

### 3. Sign-Up Flow

- Add a sign-up form/modal accessible from the nav bar (alongside or replacing the current admin-only login)
- Use Supabase Auth `signUp` with email and password
- After sign-up, the user should be logged in automatically
- Update `auth-provider.tsx` to expose the current user's `id` for ownership checks
- Update `admin-login-modal.tsx` (or create a new component) to support both login and sign-up tabs/modes

### 4. Build Ownership

- When creating a build, set `user_id` to `auth.uid()` (the current user's ID)
- Update `hooks/use-build-actions.ts` to include `user_id` in the insert payload
- On the main page, show edit/delete controls only on builds the current user owns (or if they are admin)
- Update `hooks/use-builds.ts` to include `user_id` in the fetched build data so the UI can compare ownership

### 5. UI Changes

- On the main build grid/cards (`components/gear-card.tsx`), show an "Edit" / "Delete" button only if:
  - The user is logged in AND `build.user_id === user.id`, OR
  - The user is an admin
- The `/admin/add` page should be accessible to any logged-in user (not just admins) — consider renaming the route to `/builds/new` or keeping it and removing the admin guard
- The `/admin/edit` and `/admin/delete` pages should:
  - Allow any logged-in user to edit/delete their own builds
  - Allow admins to edit/delete any build
  - Redirect or show an error if the user doesn't own the build and isn't admin

### 6. Constraints

- Do NOT break existing functionality — unregistered users must still be able to browse all builds
- Do NOT remove the admin role — admins retain full access to all builds
- Keep the existing "Cyber-Apocalyptic" dark theme for any new UI components
- Use the existing Supabase client from `lib/supabase.ts`
- Follow the existing code patterns (React hooks, TypeScript, Tailwind CSS)
- Existing builds with `user_id = NULL` should be editable only by admins

---

## Expected Deliverables

1. SQL migration statements for the `builds` table and updated RLS policies
2. Updated or new auth components (sign-up form)
3. Updated `auth-provider.tsx` with user ID exposure
4. Updated `use-build-actions.ts` with `user_id` in create payload
5. Updated `use-builds.ts` to fetch `user_id`
6. Updated UI components with ownership-based edit/delete visibility
7. Updated route guards on admin pages
