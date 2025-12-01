# 🎮 Once Human - Build Tracker

A web application for creating, viewing, and managing player builds for the game *Once Human*. Features admin authentication, role-based access control, and a fully normalized database structure.

**🌐 Live Demo**: [https://ohbuilds.moabdrabou.dev/](https://ohbuilds.moabdrabou.dev/)

## 🌟 Features

- **📖 Public Build Viewer**: Browse and view detailed game builds
- **🔐 Admin Authentication**: Secure login using Supabase Auth
- **➕ Add Builds**: Authenticated users can create new builds with detailed gear, abilities, and cradle configurations
- **✏️ Edit Builds**: Admins can modify existing builds
- **🗑️ Delete Builds**: Remove outdated or incorrect builds
- **📝 Request Data**: Public form for users to request missing builds or data
- **🛡️ Row-Level Security**: Database-level access control ensures data integrity
- **📱 Responsive Design**: Dark themed UI that works across devices

## 🏗️ Architecture

### Frontend (Static HTML/JS)
- **Static Pages**: Pure HTML/CSS/JavaScript (deployable to GitHub Pages)
- **Supabase Client**: Uses CDN-loaded `@supabase/supabase-js` for database and auth
- **Session Persistence**: localStorage-based authentication across pages
- **Protected Routes**: Client-side guards for admin-only pages

### Backend (Supabase)
- **PostgreSQL Database**: Fully normalized schema with 11 tables
- **Authentication**: Email/password login with session management
- **Row-Level Security**: Public read access, authenticated write access
- **Real-time Sync**: Automatic session restoration across page navigations

## 📊 Database Schema

### Core Tables

#### `Builds`
Stores the core build identity.
- **PK**: `id` (UUID)
- **FK**: `calibration_id` → `calibration.id`
- **Fields**: `build_name`, `calibration_id`

#### `Build_Gear`
Central assignment table linking 9 gear slots to builds.
- **Composite PK**: `(build_id, slot_name)`
- **FKs**: 
  - `build_id` → `builds.id`
  - `mod_id` → `mod_master_list.id`
  - `hide_material_id` → `hide_master_list.id`
  - `weapon_id` → `weapon_master_list.id` (for weapon slots)
  - `gear_set_id` → `gear_set_master_list.id` (for armor slots)
- **Slots**: `helmet`, `jacket`, `pants`, `boots`, `gloves`, `mask`, `weapon_1`, `weapon_2`, `melee`

#### `Build_Cradle`
Links 8 Cradle Override items to builds.
- **Composite PK**: `(build_id, item_slot)`
- **FKs**: 
  - `build_id` → `builds.id`
  - `cradle_item_id` → `cradle_master_list.id`

#### `Build_Ability_Assignment`
Links 3 major abilities (by rank) to builds.
- **Composite PK**: `(build_id, ability_rank)`
- **FKs**: 
  - `build_id` → `builds.id`
  - `ability_master_id` → `ability_master_list.id`

### Master List Tables (Normalized Data)

| Table | Purpose |
|-------|---------|
| `Calibration` | Weapon calibration setups |
| `Cradle_Master_List` | Cradle override names |
| `Mod_Master_List` | Mod names/suffixes |
| `Hide_Master_List` | Hide material names |
| `Weapon_Master_List` | Weapon names |
| `Gear_Set_Master_List` | Gear set names |
| `Ability_Master_List` | Core ability names |

### Relationships

```
Builds (1) ──────────── (1) Calibration
   │
   ├──────── (1:N) ────── Build_Gear ──────── (N:1) ────── Gear_Set_Master_List
   │                          │                                  Weapon_Master_List
   │                          │                                  Mod_Master_List
   │                          │                                  Hide_Master_List
   │
   ├──────── (1:N) ────── Build_Cradle ────── (N:1) ────── Cradle_Master_List
   │
   └──────── (1:N) ────── Build_Ability_Assignment ─ (N:1) ─ Ability_Master_List
```

**Key Design Principles:**
1. **No Redundant Data**: All reusable data (mods, hides, weapons) stored once in master lists
2. **Gear vs. Weapon**: Each `Build_Gear` row uses either `gear_set_id` (armor) OR `weapon_id` (weapons), never both
3. **Calibration Reuse**: Multiple builds can reference the same calibration configuration

## 🔐 Authentication & Security

### User Roles
- **Public Users**: Can view all builds and submit data requests
- **Authenticated Users**: Can create and delete builds
- **Admin Users**: Identified by `user_metadata.is_admin = true`

### Row-Level Security (RLS)
All tables enforce PostgreSQL RLS policies:
- **SELECT**: Public access (anyone can read)
- **INSERT/UPDATE/DELETE**: Requires authentication (`auth.uid() IS NOT NULL`)

### Protected Pages
- `add_build.html`: Requires Admin Authentication
- `edit_build.html`: Requires Admin Authentication
- `delete_build.html`: Requires Admin Authentication
- Unauthenticated access redirects to `index.html` with alert

## 🚀 Local Development

### Prerequisites
- Python 3.x (for local server)
- Modern web browser
- Supabase account (already configured)

### Running Locally

**Important**: You must use an HTTP server (not `file://`) for session persistence to work.

```bash
# Navigate to project directory
cd /path/to/OnceHuman-Builds

# Start local server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/index.html
```

**Why HTTP server is required**: The `file://` protocol isolates localStorage between HTML files for security. An HTTP server provides a common origin (`http://localhost:8000`) allowing session sharing across pages.

## 📦 Deployment (GitHub Pages)

```bash
# 1. Commit changes
git add .
git commit -m "Deploy build tracker"

# 2. Push to GitHub
git push origin main

# 3. Enable GitHub Pages
# Go to repo Settings → Pages
# Source: Deploy from branch 'main'
# Folder: / (root)

# 4. Access at:
# https://[username].github.io/OnceHuman-Builds/
```

**Session Persistence on GitHub Pages**: Works automatically because all pages share the same `https://` origin.

## 📁 File Structure

```
OnceHuman-Builds/
├── index.html              # Main build viewer
├── add_build.html          # Build creation form (protected)
├── edit_build.html         # Build editing form (protected)
├── delete_build.html       # Build deletion interface (protected)
├── request_data.html       # Public data request form
├── config.js               # Supabase client initialization
├── script.js               # Index page logic + admin auth
├── auth.js                 # Shared auth logic + route guards
├── add_build.js            # Add build form logic
├── edit_build.js           # Edit build form logic
├── delete_build.js         # Delete build logic
├── styles.css              # Dark theme styling
└── README.md               # This file
```

## 🔧 Troubleshooting

### Session Not Persisting
- **Problem**: Login works on `index.html` but session is lost on other pages
- **Solution**: Use HTTP server (`python3 -m http.server`), not `file://` protocol

### RLS Errors (Code 42501)
- **Problem**: "new row violates row-level security policy"
- **Solution**: Ensure you're logged in and session is active. Check browser console for "Config.js - Session loaded: { hasSession: true }"

### Protected Page Access
- **Problem**: Can't access `add_build.html` or `delete_build.html`
- **Solution**: Log in first on `index.html`. Session must be active.

## 📝 License

This project is for personal use and game build tracking.

---

**Built with**: Vanilla JavaScript • Supabase • PostgreSQL • GitHub Pages
