'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface BuildPayload {
  buildName: string;
  calibrationId: string;
  cradleItems: Array<{ cradle_item_id: string; slot_number: number }>;
  abilities: Array<{ ability_id: string; rank: number }>;
  gearItems: Array<{
    slot_name: string;
    mod_id: string | null;
    hide_material_id: string | null;
    weapon_id: string | null;
    gear_set_id: string | null;
  }>;
}

export function useBuildActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBuild = async (payload: BuildPayload) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Insert Build
      const { data: buildData, error: buildError } = await supabase
        .from('builds')
        .insert([{ build_name: payload.buildName, calibration_id: payload.calibrationId }])
        .select()
        .single();

      if (buildError) throw buildError;
      const buildId = buildData.id;

      // 2. Insert related data
      await _insertRelatedData(buildId, payload);
      
      return buildId;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBuild = async (buildId: string, payload: BuildPayload) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Update Build base
      const { error: buildError } = await supabase
        .from('builds')
        .update({ build_name: payload.buildName, calibration_id: payload.calibrationId })
        .eq('id', buildId);

      if (buildError) throw buildError;

      // 2. Delete existing related data
      await _deleteRelatedData(buildId);

      // 3. Re-insert new data
      await _insertRelatedData(buildId, payload);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBuild = async (buildId: string) => {
    setLoading(true);
    setError(null);
    try {
      await _deleteRelatedData(buildId);
      const { error: buildError } = await supabase
        .from('builds')
        .delete()
        .eq('id', buildId);
      if (buildError) throw buildError;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const _insertRelatedData = async (buildId: string, payload: BuildPayload) => {
    const cradlePayload = payload.cradleItems.map(item => ({
      build_id: buildId,
      cradle_item_id: item.cradle_item_id,
      item_slot: item.slot_number
    }));

    const gearPayload = payload.gearItems.map(item => ({
      build_id: buildId,
      ...item
    }));

    const abilityPayload = payload.abilities.map(ability => ({
      build_id: buildId,
      ability_master_id: ability.ability_id,
      ability_rank: ability.rank
    }));

    const promises = [];
    if (cradlePayload.length > 0) promises.push(supabase.from('build_cradle').insert(cradlePayload));
    if (gearPayload.length > 0) promises.push(supabase.from('build_gear').insert(gearPayload));
    if (abilityPayload.length > 0) promises.push(supabase.from('build_ability_assignment').insert(abilityPayload));

    const results = await Promise.all(promises);
    const firstError = results.find(r => r.error)?.error;
    if (firstError) throw firstError;
  };

  const _deleteRelatedData = async (buildId: string) => {
    const results = await Promise.all([
      supabase.from('build_cradle').delete().eq('build_id', buildId),
      supabase.from('build_ability_assignment').delete().eq('build_id', buildId),
      supabase.from('build_gear').delete().eq('build_id', buildId)
    ]);
    const firstError = results.find(r => r.error)?.error;
    if (firstError) throw firstError;
  };

  return { createBuild, updateBuild, deleteBuild, loading, error };
}
