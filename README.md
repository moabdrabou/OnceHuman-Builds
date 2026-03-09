# 🎮 Once Human - Build Tracker

A full-stack **Next.js** web application for character builds for the game 'once Human'. Features real-time data fetching via Supabase, optimized React components for gear filtering, and a custom UI for theorycrafting..

**🌐 Live Demo**: [https://ohbuilds.moabdrabou.dev/](https://ohbuilds.moabdrabou.dev/)

---

## 🌟 Features

- **📖 Public Build Viewer**: Browse and filter all builds with live search and element-type filtering
- **🔎 Neural Search**: Real-time search across build names, gear, and calibration data
- **🔐 Admin Authentication**: Secure login via Supabase Auth with `is_admin` metadata guard
- **➕ Add Build**: Dynamic form that fetches all master-list options from Supabase and performs multi-table relational inserts
- **✏️ Edit Build**: Admins can modify any existing build's full loadout
- **🗑️ Delete Build**: Multi-step relational deletion — clears abilities, cradle, and gear before removing the root build record
- **🛡️ Row-Level Security**: PostgreSQL RLS policies enforce data integrity at the database level
- **📱 Responsive Design**: Dark "Cyber-Apocalyptic" theme built with Tailwind CSS v4

---

## 🏗️ Architecture

### Frontend (Next.js App Router)
- **Framework**: Next.js 16 with the App Router (`app/` directory)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4 + custom CSS animations (glassmorphism, glitch effects, scan lines)
- **Font**: JetBrains Mono (Google Fonts) for the tactical/terminal aesthetic
- **UI Primitives**: Radix UI component library + Lucide React icons
- **State**: React hooks (`useState`, `useMemo`, custom hooks for data fetching)

### Backend (Supabase)
- **Database**: PostgreSQL (fully normalized, 11 tables)
- **Auth**: Email/password login with `user_metadata.is_admin` custom claim
- **RLS**: Public SELECT, authenticated-only INSERT/UPDATE/DELETE
- **Client**: `@supabase/supabase-js` v2 initialized in `lib/supabase.ts`

---

## 📁 File Structure

```
OnceHuman-Builds/
├── app/
│   ├── layout.tsx               # Root layout — JetBrains Mono font, AuthProvider, Analytics
│   ├── page.tsx                 # Main dashboard — build grid, search, filters, detail view
│   ├── globals.css              # Global styles, CSS variables, custom animations
│   └── admin/
│       ├── add/page.tsx         # Add Build form (fetches all master lists, relational insert)
│       ├── delete/page.tsx      # Purge Build page (multi-step relational deletion)
│       └── edit/page.tsx        # Edit Build — full loadout form with build picker
├── components/
│   ├── auth-provider.tsx        # Auth context: exposes `user`, `isAdmin`, `loading`
│   ├── tactical-nav.tsx         # Top navigation bar with admin modal trigger
│   ├── admin-login-modal.tsx    # Supabase email/password login modal
│   ├── gear-card.tsx            # Build summary card for the grid view
│   ├── build-detail.tsx         # Full build loadout breakdown (tactical display)
│   ├── filter-panel.tsx         # Element-type filter buttons
│   ├── neural-search.tsx        # Debounced search input
│   ├── gear-sets-view.tsx       # Gear sets reference page
│   ├── weapon-database.tsx      # Weapon database reference page
│   ├── profile-view.tsx         # Player profile view
│   ├── weapon-icons.tsx         # SVG weapon icon components
│   └── ui/                      # Radix UI-based shadcn/ui components
├── hooks/
│   ├── use-builds.ts            # Fetches and enriches all builds from Supabase
│   ├── use-build-actions.ts     # Add / edit / delete build mutations
│   ├── use-master-data.ts       # Fetches all master list tables in parallel
│   ├── use-mobile.ts            # Mobile breakpoint detection
│   └── use-toast.ts             # Toast notification hook
├── lib/
│   └── supabase.ts              # Supabase client singleton
├── public/
│   └── OH16x16.png              # Favicon
├── styles/
│   └── globals.css              # (legacy, merged into app/globals.css)
├── next.config.mjs              # Next.js config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## 📊 Database Schema

### Core Tables

#### `builds`
Stores the core build identity.
- **PK**: `id` (UUID)
- **FK**: `calibration_id` → `calibration.id`
- **Fields**: `build_name`, `calibration_id`

#### `build_gear`
Central assignment table linking 9 gear slots to builds.
- **Composite PK**: `(build_id, slot_name)`
- **Slots**: `helmet`, `jacket`, `pants`, `boots`, `gloves`, `mask`, `weapon_1`, `weapon_2`, `melee`
- **FKs**: `build_id`, `mod_id`, `hide_material_id`, `weapon_id` (weapons), `gear_set_id` (armor)

#### `build_cradle`
Links up to 8 Cradle Override items (by slot index) to a build.
- **Composite PK**: `(build_id, item_slot)`

#### `build_ability_assignment`
Links up to 3 key abilities (by rank) to a build.
- **Composite PK**: `(build_id, ability_rank)`

### Master List Tables

| Table | Purpose |
|-------|---------|
| `calibration` | Weapon calibration configurations |
| `cradle_master_list` | Cradle override item names |
| `mod_master_list` | Mod names |
| `hide_master_list` | Hide material names |
| `weapon_master_list` | Weapon names |
| `gear_set_master_list` | Gear set names |
| `ability_master_list` | Core ability names |

### Relationships

```
builds (1) ──────────── (1) calibration
   │
   ├──── (1:N) ── build_gear ──────── (N:1) ── gear_set_master_list
   │                   │                        weapon_master_list
   │                   │                        mod_master_list
   │                   │                        hide_master_list
   │
   ├──── (1:N) ── build_cradle ────── (N:1) ── cradle_master_list
   │
   └──── (1:N) ── build_ability_assignment ─── (N:1) ── ability_master_list
```

**Key Design Principles:**
1. **No Redundant Data**: All reusable data stored once in master lists
2. **Gear vs. Weapon**: Each `build_gear` row uses either `gear_set_id` (armor) OR `weapon_id` (weapons), never both
3. **Ordered Slots**: Cradle items and abilities are indexed by slot/rank for consistent display order

---

## 🔐 Authentication & Security

### User Roles
- **Public Users**: Can view all builds and browse the database
- **Admin Users**: Identified by `user_metadata.is_admin = true` in Supabase Auth

### Route Protection
All admin pages (`/admin/add`, `/admin/delete`, `/admin/edit`) check `isAdmin` on mount via the `AuthProvider` context. Unauthenticated access triggers an alert and redirects to `/`.

### Row-Level Security (RLS)
- **SELECT**: Public — anyone can read
- **INSERT / UPDATE / DELETE**: Requires `auth.uid() IS NOT NULL`

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm
- A Supabase project (connection details in `.env.local`)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/OnceHuman-Builds.git
cd OnceHuman-Builds

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local
# Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Start the dev server
npm run dev
# Open http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📦 Deployment

Build and deploy the app to any Node.js-compatible host. Set the following environment variables on your platform:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

Run `npm run build && npm start` to serve the production build.

---

## 🔧 Troubleshooting

### Build Data Not Loading
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Open browser DevTools → Console and look for Supabase errors

### RLS Errors (Code 42501)
- "new row violates row-level security policy"
- Ensure you are logged in as an admin before attempting write operations

### Admin Pages Redirecting to Home
- Your Supabase user must have `is_admin: true` in `user_metadata`
- Set this in the Supabase dashboard under **Authentication → Users → Edit User**

### Weapons / Gear Not Appearing in Add Form
- All master list tables must be populated in Supabase
- Verify `weapon_master_list`, `gear_set_master_list`, `mod_master_list`, `hide_master_list`, `cradle_master_list`, and `ability_master_list` have rows

---

## 📝 License

This project is for personal use and game build tracking.

---

**Built with**: Next.js 16 • React 19 • TypeScript • Tailwind CSS v4 • Supabase • Radix UI
