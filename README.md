# 🛠️ Once Human Build Tracker Database

## 🚀 Project Goal

This database schema is designed to efficiently store and manage complex player build data for the game *Once Human*. The core objective is to achieve **high normalization** to ensure data integrity, prevent duplication, and allow for easy, centralized updates to master lists (Mods, Hides, Weapons, Cradle Overrides, etc.).

This structure supports the complex requirements of linking multiple variable items (9 Gear, 8 Cradle Overrides, 3 Major Abilities) to a single reusable build definition.

## 🗄️ Database Schema Overview (7 Tables)

The database consists of **four Master List tables** and **three Core/Junction tables**.

### Core & Junction Tables

These tables define the build itself and handle the Many-to-Many relationships.

| Table Name | Purpose | Primary Key (PK) | Foreign Keys (FKs) |
| :--- | :--- | :--- | :--- |
| **`builds`** | Stores the core build identity (name, type). | `id` (UUID) | `calibration_id` (FK to `calibration`) |
| **`build_gear`** | **Central Assignment Table.** Links the 9 gear slots (cloth + weapons) to the build and to the master item lists. | (`build_id`, `slot_name`) | `build_id`, `mod_id`, `hide_material_id`, `weapon_id`, `gear_set_id` |
| **`build_ability_assignment`** | Links the 3 core Major Abilities (by rank) to the build. | (`build_id`, `ability_rank`) | `build_id`, `ability_master_id` |
| **`build_cradle`** | Links the 8 variable Cradle Overrides (by slot) to the build. | (`build_id`, `item_slot`) | `build_id`, `cradle_item_id` |

---

### Master List Tables (Reusable Data Pools)

These tables contain the full, unique list of items and attributes that are referenced by the core build tables.

| Table Name | Purpose | Data Size |
| :--- | :--- | :--- |
| **`calibration`** | **REUSABLE.** Stores the list of all unique Weapon Calibration setups (e.g., 'Rapid Shot + 2 Crit Rate'). | ~32 entries |
| **`cradle_master_list`** | Stores the 25 unique Cradle Override names (e.g., 'Shield Protection', 'Tactical Combo'). | 25 entries |
| **`mod_master_list`** | Stores all unique Mod names/suffixes (e.g., 'Deadshot (Violent)', 'Thunderclap'). | ~45 entries |
| **`hide_master_list`** | Stores all unique hide material names (e.g., 'Lunar Wool', 'Polar Fox Skin', 'Cowhide'). | ~40 entries |
| **`weapon_master_list`**| Stores all unique weapon names (e.g., 'SOCR - Outsider', 'Kukri'). | ~46 entries |
| **`gear_set_master_list`**| Stores all unique gear set names and individual armor pieces (e.g., 'Lonewolf', 'Viper Mask'). | ~46 entries |
| **`ability_master_list`** | Stores the names of core Substats (e.g., 'DMG against Great Ones', 'Crit Damage'). | 8 entries |

---

## 🔗 Key Relationships and Normalization

The schema is built around the principle of **no redundant data**.

1.  **Gear Item vs. Weapon:** A row in `build_gear` uses **either** the `gear_set_id` (for armor/mask/etc. items) **OR** the `weapon_id` (for Weapon 1, 2, or 3), but never both (`NULL` in one column).
2.  **Mods and Hides:** Every gear item references its specific Mod and Hide material by ID (`mod_id` and `hide_material_id`), ensuring consistent naming across the entire database.
3.  **Calibration Reuse:** The `builds` table points to a single `calibration_id`, meaning multiple builds can instantly reuse the exact same calibration notes without duplicating the text.

## 💾 Fetching a Complete Build

To retrieve all information for a single build, you must execute a single query using nested `JOIN` operations:

```sql
SELECT
    *,
    calibration_setup:calibration_id (notes),
    build_ability_assignment (
        ability_rank,
        ability_master:ability_master_id (ability_name)
    ),
    build_gear (
        slot_name,
        weapon_master:weapon_id (weapon_name, weapon_type),
        gear_set_master:gear_set_id (set_name),
        mod:mod_id (mod_name),
        hide_material:hide_material_id (material_name)
    ),
    build_cradle (
        item_slot, 
        cradle_item:cradle_item_id (item_name)
    )
FROM builds
WHERE build_name = 'Phoenix Sentinel';
