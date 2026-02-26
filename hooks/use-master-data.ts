'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MasterData {
  calibrations: any[];
  cradleItems: any[];
  abilities: any[];
  hideOptions: any[];
  modOptions: any[];
  gearSets: any[];
  weapons: any[];
  meleeWeapons: any[];
  dmgTypes: any[];
}

export function useMasterData() {
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          calibrationRes,
          cradleRes,
          abilityRes,
          hideRes,
          modRes,
          gearSetRes,
          allWeaponsRes,
          dmgTypeRes
        ] = await Promise.all([
          supabase.from('calibration').select('id, name').order('name'),
          supabase.from('cradle_master_list').select('id, item_name').order('item_name'),
          supabase.from('ability_master_list').select('id, ability_name').order('ability_name'),
          supabase.from('hide_master_list').select('id, material_name').order('material_name'),
          supabase.from('mod_master_list').select('id, mod_name').order('mod_name'),
          supabase.from('gear_set_master_list').select('id, set_name').order('set_name'),
          supabase.from('weapon_master_list').select('id, weapon_name, dmg_type_id, dmg_types(id, label)').order('weapon_name'),
          supabase.from('dmg_types').select('id, label').order('label')
        ]);

        const results = [
          { name: 'calibration', error: calibrationRes.error },
          { name: 'cradle', error: cradleRes.error },
          { name: 'ability', error: abilityRes.error },
          { name: 'hide', error: hideRes.error },
          { name: 'mod', error: modRes.error },
          { name: 'gearSet', error: gearSetRes.error },
          { name: 'allWeapons', error: allWeaponsRes.error },
          { name: 'dmgTypes', error: dmgTypeRes.error }
        ];

        const errors = results.filter(r => r.error);

        if (errors.length > 0) {
          console.error('MASTER_DATA_FETCH: PARTIAL_FAILURE', errors);
          throw new Error(`Master data failed to fetch: ${errors.map(e => e.name).join(', ')}`);
        }

        const mapLabel = (label: string) => label === "Fortress Warefare" ? "Fortress Warfare" : label;

        const allWeapons = (allWeaponsRes.data || []).map(w => ({
          ...w,
          dmg_types: Array.isArray(w.dmg_types) 
            ? w.dmg_types.map((dt: any) => ({ ...dt, label: mapLabel(dt.label) }))
            : (w.dmg_types ? { ...(w.dmg_types as object), label: mapLabel((w.dmg_types as any).label) } : null)
        }));

        const weapons = allWeapons;
        const meleeWeapons: any[] = []; 

        setData({
          calibrations: calibrationRes.data || [],
          cradleItems: cradleRes.data || [],
          abilities: abilityRes.data || [],
          hideOptions: hideRes.data || [],
          modOptions: modRes.data || [],
          gearSets: gearSetRes.data || [],
          weapons: weapons,
          meleeWeapons: meleeWeapons,
          dmgTypes: (dmgTypeRes.data || []).map(d => ({ ...d, label: mapLabel(d.label) }))
        });
      } catch (err: any) {
        console.error('MASTER_DATA_FETCH: CRITICAL_ERROR', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { data, loading, error };
}
