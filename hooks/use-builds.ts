'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMasterData } from './use-master-data';

export interface EnrichedBuild {
  id: string;
  name: string;
  author: string;
  dmgType: string;
  weapon: string; // Legacy field for list view
  weapons: {
    primary: { item: string; mod: string };
    secondary: { item: string; mod: string };
    melee: { item: string; mod: string };
  };
  tier: "S" | "A" | "B" | "C";
  rating: number;
  views: number;
  description: string;
  calibration: string;
  cradle: string[];
  abilities: string[];
  gear: {
    [slot: string]: {
      item: string;
      hide: string;
      mod: string;
    };
  };
  gearList: Array<{
    slot: string;
    hide: string;
    item: string;
    mod: string;
  }>;
  stats: {
    critRate: number;
    critDmg: number;
    elementalDmg: number;
    defense: number;
    hp: number;
    stamina: number;
  };
}

export function useBuilds() {
  const [builds, setBuilds] = useState<EnrichedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { data: master, loading: masterLoading, error: masterError } = useMasterData();

  useEffect(() => {
    if (masterLoading) return;

    if (masterError) {
      console.error('BUILDS_FETCH: ABORTED_DUE_TO_MASTER_ERROR', masterError);
      setError(masterError);
      setLoading(false);
      return;
    }

    if (!master) {
      console.warn('BUILDS_FETCH: ABORTED_DUE_TO_MISSING_MASTER_DATA');
      setLoading(false);
      return;
    }

    async function fetchAndEnrich() {
      setLoading(true);
      try {
        const { data: buildsData, error: buildsError } = await supabase
          .from('builds')
          .select('*');

        if (buildsError) {
          console.error('BUILDS_FETCH: SUPABASE_ERROR', buildsError);
          throw buildsError;
        }

        if (!buildsData || buildsData.length === 0) {
          setBuilds([]);
          setLoading(false);
          return;
        }

        // Maps for fast lookup
        const gearSetMap = Object.fromEntries(master!.gearSets.map(g => [g.id, g.set_name]));
        const weaponMap = Object.fromEntries([...master!.weapons, ...master!.meleeWeapons].map(w => [w.id, w.weapon_name]));
        const modMap = Object.fromEntries(master!.modOptions.map(m => [m.id, m.mod_name]));
        const hideMap = Object.fromEntries(master!.hideOptions.map(h => [h.id, h.material_name]));
        const calibrationMap = Object.fromEntries(master!.calibrations.map(c => [c.id, c.name]));
        const cradleMap = Object.fromEntries(master!.cradleItems.map(c => [c.id, c.item_name]));
        const abilityMap = Object.fromEntries(master!.abilities.map(a => [a.id, a.ability_name]));
        const weaponDmgTypeMap = Object.fromEntries([...master!.weapons].map(w => [w.id, w.dmg_types?.label || w.dmg_type_id]));
        const dmgTypeMap = Object.fromEntries(master!.dmgTypes.map(d => [d.id, d.label]));

        const enrichedBuilds = await Promise.all(buildsData.map(async (build) => {
          const [gearRes, cradleRes, abilityRes] = await Promise.all([
            supabase.from('build_gear').select('*').eq('build_id', build.id),
            supabase.from('build_cradle').select('*').eq('build_id', build.id),
            supabase.from('build_ability_assignment').select('*').eq('build_id', build.id)
          ]);

          const gearArray = (gearRes.data || []).map(g => {
            const isWeapon = g.slot_name && (g.slot_name.includes('weapon') || g.slot_name === 'melee');
            return {
              slot: g.slot_name as string,
              hide: isWeapon ? '-' : (hideMap[g.hide_material_id] || 'N/A'),
              item: gearSetMap[g.gear_set_id] || weaponMap[g.weapon_id] || 'N/A',
              mod: modMap[g.mod_id] || 'N/A'
            };
          });

          // Create localized gear and weapons objects
          const gearObj: any = {
            helmet: { item: "N/A", hide: "N/A", mod: "N/A" },
            jacket: { item: "N/A", hide: "N/A", mod: "N/A" },
            pants: { item: "N/A", hide: "N/A", mod: "N/A" },
            gloves: { item: "N/A", hide: "N/A", mod: "N/A" },
            boots: { item: "N/A", hide: "N/A", mod: "N/A" },
            mask: { item: "N/A", hide: "N/A", mod: "N/A" },
          };

          const weaponObj = {
            primary: { item: "N/A", mod: "N/A" },
            secondary: { item: "N/A", mod: "N/A" },
            melee: { item: "N/A", mod: "N/A" },
          };

          gearArray.forEach(g => {
            if (g.slot === 'accessory') {
               gearObj.mask = { item: g.item, hide: g.hide, mod: g.mod };
            } else if (g.slot in gearObj) {
              gearObj[g.slot] = { item: g.item, hide: g.hide, mod: g.mod };
            } else if (g.slot === 'weapon_1') {
              weaponObj.primary = { item: g.item, mod: g.mod };
            } else if (g.slot === 'weapon_2') {
              weaponObj.secondary = { item: g.item, mod: g.mod };
            } else if (g.slot === 'melee') {
              weaponObj.melee = { item: g.item, mod: g.mod };
            }
          });

          const weaponItem = weaponObj.primary.item !== "N/A" ? weaponObj.primary.item : weaponObj.secondary.item;

          // Resolve DMG Type from weapon
          const weaponIdForDmg = weaponObj.primary.item !== "N/A" 
            ? buildsData.find((b: any) => b.id === build.id)?.weapon_1_id // This logic might need build_gear lookup
            : buildsData.find((b: any) => b.id === build.id)?.weapon_2_id;
            
          // Better: use the gearArray we just built which has the actual IDs
          const primaryWeaponId = (gearRes.data || []).find(g => g.slot_name === 'weapon_1')?.weapon_id;
          const secondaryWeaponId = (gearRes.data || []).find(g => g.slot_name === 'weapon_2')?.weapon_id;
          const targetWeaponId = primaryWeaponId || secondaryWeaponId;
          const dmgValue = weaponDmgTypeMap[targetWeaponId];
          const dmgTypeLabel = dmgTypeMap[dmgValue] || (typeof dmgValue === 'string' && !dmgValue.includes('-') ? dmgValue : "None");

          const cradle = (cradleRes.data || [])
            .sort((a, b) => a.item_slot - b.item_slot)
            .map(c => cradleMap[c.cradle_item_id] || 'N/A');

          const abilities = (abilityRes.data || [])
            .sort((a, b) => a.ability_rank - b.ability_rank)
            .map(a => abilityMap[a.ability_master_id] || 'N/A');

          return {
            id: build.id,
            name: build.build_name,
            author: build.author || "ANONYMOUS_OPERATIVE",
            dmgType: dmgTypeLabel,
            weapon: weaponItem,
            weapons: weaponObj,
            tier: (build.tier || "B") as "S" | "A" | "B" | "C",
            rating: build.rating || 5,
            views: build.views || 0,
            description: build.description || "TACTICAL_DATA_ENCRYPTED",
            calibration: calibrationMap[build.calibration_id] || 'N/A',
            cradle,
            abilities,
            gear: gearObj,
            gearList: gearArray,
            stats: {
              critRate: build.crit_rate || 0,
              critDmg: build.crit_dmg || 0,
              elementalDmg: build.elemental_dmg || 0,
              defense: build.defense || 0,
              hp: build.hp || 0,
              stamina: build.stamina || 0
            }
          };
        }));

        setBuilds(enrichedBuilds);
      } catch (err: any) {
        console.error('BUILDS_FETCH: CRITICAL_ERROR', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAndEnrich();
  }, [master, masterLoading, masterError]);

  return { builds, loading: loading || masterLoading, error };
}
