import { supabase } from "@/lib/supabase"
import { isNewItem, getNewItemName } from "@/components/admin/creatable-combobox"

/**
 * Master table configuration for Just-In-Time insertions.
 * Maps a category key to the Supabase table name and its name column.
 */
const MASTER_TABLES: Record<string, { table: string; nameCol: string }> = {
  weapon: { table: "weapon_master_list", nameCol: "weapon_name" },
  mod: { table: "mod_master_list", nameCol: "mod_name" },
  gearSet: { table: "gear_set_master_list", nameCol: "set_name" },
  hide: { table: "hide_master_list", nameCol: "material_name" },
  calibration: { table: "calibration", nameCol: "name" },
  cradle: { table: "cradle_master_list", nameCol: "item_name" },
  ability: { table: "ability_master_list", nameCol: "ability_name" },
}

/**
 * Resolves a form value to a UUID. If it's already a UUID, returns it as-is.
 * If it's a "new:Name" value, inserts into the master table and returns the new UUID.
 * Handles unique constraint conflicts by fetching the existing record.
 *
 * @param category - Key from MASTER_TABLES (e.g., "weapon", "mod")
 * @param value - Either a UUID string or a "new:ItemName" string
 * @returns The resolved UUID, or null if value is empty
 */
export async function resolveValue(
  category: string,
  value: string,
): Promise<string | null> {
  if (!value) return null
  if (!isNewItem(value)) return value

  const config = MASTER_TABLES[category]
  if (!config) {
    throw new Error(`Unknown master table category: ${category}`)
  }

  const name = getNewItemName(value)

  // Try to insert the new item
  const { data, error } = await supabase
    .from(config.table)
    .insert({ [config.nameCol]: name })
    .select("id")
    .single()

  if (data) return data.id

  // Handle unique constraint violation — item was created by another process
  if (error && (error.code === "23505" || error.message?.includes("duplicate"))) {
    const { data: existing, error: fetchError } = await supabase
      .from(config.table)
      .select("id")
      .eq(config.nameCol, name)
      .single()

    if (fetchError) {
      throw new Error(
        `Failed to resolve duplicate ${category} "${name}": ${fetchError.message}`,
      )
    }
    return existing.id
  }

  throw new Error(
    `Failed to create ${category} "${name}": ${error?.message ?? "Unknown error"}`,
  )
}

/**
 * Batch-resolves multiple values, returning an array of resolved UUIDs.
 * Maintains order — null entries stay null.
 */
export async function resolveValues(
  category: string,
  values: string[],
): Promise<(string | null)[]> {
  return Promise.all(values.map((v) => resolveValue(category, v)))
}

/**
 * Refreshes a single master data list from Supabase after JIT insertions.
 * Returns the fresh data array.
 */
export async function refreshMasterList(
  category: string,
): Promise<any[]> {
  const config = MASTER_TABLES[category]
  if (!config) return []

  const { data } = await supabase
    .from(config.table)
    .select("*")
    .order(config.nameCol)

  return data || []
}
