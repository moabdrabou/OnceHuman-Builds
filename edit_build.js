// Supabase Initialization handled in config.js

// DOM Elements
const calibrationSelect = document.getElementById('calibration-select');
const cradleContainer = document.getElementById('cradle-container');
const abilitiesContainer = document.getElementById('abilities-container');
const buildSelect = document.getElementById('build-select');
const buildSelectContainer = document.getElementById('build-selector-container');

// Get Build ID from URL
const urlParams = new URLSearchParams(window.location.search);
let currentBuildId = urlParams.get('id');

// Fetch Options from DB (Reused from add_build.js logic)
async function fetchOptions() {
  try {
    const [calibrationRes, cradleRes, abilityRes, hideRes, modRes, gearSetRes, allWeaponsRes] = await Promise.all([
      supabaseClient.from('calibration').select('id, name').order('name', { ascending: true }),
      supabaseClient.from('cradle_master_list').select('id, item_name').order('item_name', { ascending: true }),
      supabaseClient.from('ability_master_list').select('id, ability_name').order('ability_name', { ascending: true }),
      supabaseClient.from('hide_master_list').select('id, material_name').order('material_name', { ascending: true }),
      supabaseClient.from('mod_master_list').select('id, mod_name').order('mod_name', { ascending: true }),
      supabaseClient.from('gear_set_master_list').select('id, set_name').order('set_name', { ascending: true }),
      supabaseClient.from('weapon_master_list').select('id, weapon_name, weapon_type').order('weapon_name', { ascending: true })
    ]);

    const allWeapons = allWeaponsRes.data || [];
    const weapons = allWeapons.filter(w => !w.weapon_type || w.weapon_type.trim().toLowerCase() !== 'melee');
    const meleeWeapons = allWeapons.filter(w => w.weapon_type && w.weapon_type.trim().toLowerCase() === 'melee');

    return {
      calibrations: calibrationRes.data || [],
      cradleItems: cradleRes.data || [],
      abilities: abilityRes.data || [],
      hideOptions: hideRes.data || [],
      modOptions: modRes.data || [],
      gearSets: gearSetRes.data || [],
      weapons: weapons,
      meleeWeapons: meleeWeapons
    };
  } catch (err) {
    console.error('Unexpected error fetching options:', err);
    return { calibrations: [], cradleItems: [], abilities: [], hideOptions: [], gearSets: [], weapons: [], meleeWeapons: [] };
  }
}

// Fetch All Builds for Dropdown
async function fetchAllBuilds() {
  const { data, error } = await supabaseClient.from('builds').select('id, build_name').order('build_name');
  if (error) {
    console.error('Error fetching builds:', error);
    return [];
  }
  return data || [];
}

// Populate Dropdowns
function populateDropdown(selectElement, items, valueKey, textKey, placeholder, selectedValue = null) {
  selectElement.innerHTML = `<option value="" disabled ${!selectedValue ? 'selected' : ''}>${placeholder}</option>`;
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueKey];
    option.textContent = item[textKey];
    if (selectedValue && String(item[valueKey]) === String(selectedValue)) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  });
}

// Fetch Build Data
async function fetchBuildData(id) {
  try {
    const { data: build, error } = await supabaseClient
      .from('builds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const [gearRes, cradleRes, abilityRes] = await Promise.all([
      supabaseClient.from('build_gear').select('*').eq('build_id', id),
      supabaseClient.from('build_cradle').select('*').eq('build_id', id),
      supabaseClient.from('build_ability_assignment').select('*').eq('build_id', id)
    ]);

    return {
      build: build,
      gear: gearRes.data || [],
      cradle: cradleRes.data || [],
      abilities: abilityRes.data || []
    };
  } catch (err) {
    console.error('Error fetching build data:', err);
    alert('Error loading build data.');
    return null;
  }
}

// Initialize Form
async function initForm() {
  const optionsData = await fetchOptions();

  // Populate Build Selector
  const allBuilds = await fetchAllBuilds();
  populateDropdown(buildSelect, allBuilds, 'id', 'build_name', '-- Select Build to Edit --', currentBuildId);

  // Handle Build Selection Change
  buildSelect.addEventListener('change', (e) => {
    const newId = e.target.value;
    if (newId) {
      window.location.href = `edit_build.html?id=${newId}`;
    }
  });

  // If no ID, stop here (wait for selection)
  if (!currentBuildId) {
    document.querySelector('.display-panel').style.display = 'none'; // Hide form until selected
    return;
  } else {
    document.querySelector('.display-panel').style.display = 'block';
  }

  const buildData = await fetchBuildData(currentBuildId);

  if (!buildData) return;

  // 1. Build Name
  document.getElementById('build-name').value = buildData.build.build_name;

  // 2. Calibration
  if (calibrationSelect) {
    populateDropdown(calibrationSelect, optionsData.calibrations, 'id', 'name', '-- Select Calibration --', buildData.build.calibration_id);
  }

  // 3. Cradle (8 slots)
  if (cradleContainer) {
    cradleContainer.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group';
      const label = document.createElement('label');
      label.textContent = `Cradle Slot ${i}`;
      const select = document.createElement('select');
      select.name = `cradle_${i}`;

      // Find existing item for this slot
      const existingItem = buildData.cradle.find(c => c.item_slot === i);
      const selectedId = existingItem ? existingItem.cradle_item_id : null;

      populateDropdown(select, optionsData.cradleItems, 'id', 'item_name', `-- Select Cradle Item ${i} --`, selectedId);

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      cradleContainer.appendChild(wrapper);
    }
  }

  // 4. Abilities (3 slots)
  if (abilitiesContainer) {
    abilitiesContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group';
      const label = document.createElement('label');
      label.textContent = `Ability ${i}`;
      const select = document.createElement('select');
      select.name = `ability_${i}`;

      // Find existing ability for this rank
      const existingAbility = buildData.abilities.find(a => a.ability_rank === i);
      const selectedId = existingAbility ? existingAbility.ability_master_id : null;

      populateDropdown(select, optionsData.abilities, 'id', 'ability_name', `-- Select Ability ${i} --`, selectedId);

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      abilitiesContainer.appendChild(wrapper);
    }
  }

  // 5. Gear & Weapons
  const slots = ['helmet', 'jacket', 'pants', 'boots', 'gloves', 'mask', 'weapon_1', 'weapon_2', 'melee'];

  slots.forEach(slot => {
    const isWeapon = slot.includes('weapon') || slot === 'melee';

    // Find existing gear data for this slot
    const existingGear = buildData.gear.find(g => g.slot_name === slot);

    // Select Elements
    const itemSelect = isWeapon ? document.getElementById(`item_${slot}`) : document.querySelector(`select[name="item_${slot}"]`);
    const modSelect = document.querySelector(`select[name="mod_${slot}"]`);
    const hideSelect = !isWeapon ? document.querySelector(`select[name="hide_${slot}"]`) : null;

    // Determine selected values
    let selectedItemId = null;
    if (existingGear) {
      selectedItemId = isWeapon ? existingGear.weapon_id : existingGear.gear_set_id;
    }
    const selectedModId = existingGear ? existingGear.mod_id : null;
    const selectedHideId = existingGear ? existingGear.hide_material_id : null;

    // Populate Item Select
    if (itemSelect) {
      let items = optionsData.gearSets;
      if (slot === 'melee') items = optionsData.meleeWeapons;
      else if (isWeapon) items = optionsData.weapons;

      const valueKey = 'id';
      const textKey = isWeapon ? 'weapon_name' : 'set_name';

      populateDropdown(itemSelect, items, valueKey, textKey, '-- Select Item --', selectedItemId);
    }

    // Populate Mod Select
    if (modSelect) {
      populateDropdown(modSelect, optionsData.modOptions, 'id', 'mod_name', '-- Select Mod --', selectedModId);
    }

    // Populate Hide Select
    if (hideSelect) {
      populateDropdown(hideSelect, optionsData.hideOptions, 'id', 'material_name', '-- Select Hide --', selectedHideId);
    }
  });
}

// Collect Form Data (Reused from add_build.js)
function collectFormData() {
  const buildName = document.getElementById('build-name').value;
  const calibrationId = document.getElementById('calibration-select').value;

  if (!buildName || !calibrationId) {
    alert('Please fill in Build Name and Calibration.');
    return null;
  }

  const cradleItems = [];
  for (let i = 1; i <= 8; i++) {
    const val = document.querySelector(`select[name="cradle_${i}"]`).value;
    if (val) cradleItems.push({ slot_number: i, cradle_item_id: val });
  }

  const abilities = [];
  for (let i = 1; i <= 3; i++) {
    const val = document.querySelector(`select[name="ability_${i}"]`).value;
    if (val) abilities.push({ ability_id: val, rank: i });
  }

  const gearItems = [];
  const slots = ['helmet', 'jacket', 'pants', 'boots', 'gloves', 'mask', 'weapon_1', 'weapon_2', 'melee'];

  slots.forEach(slot => {
    const isWeapon = slot.includes('weapon') || slot === 'melee';
    // Handle ID vs Name selection for weapons if needed, but here we used IDs in populate
    const itemSelect = isWeapon ? document.getElementById(`item_${slot}`) : document.querySelector(`select[name="item_${slot}"]`);
    const itemVal = itemSelect ? itemSelect.value : null;

    const modVal = document.querySelector(`select[name="mod_${slot}"]`)?.value;
    const hideVal = !isWeapon ? document.querySelector(`select[name="hide_${slot}"]`)?.value : null;

    if (itemVal) {
      const gearObj = {
        slot_name: slot,
        mod_id: modVal || null,
        hide_material_id: hideVal || null
      };

      if (isWeapon) {
        gearObj.weapon_id = itemVal;
        gearObj.gear_set_id = null;
      } else {
        gearObj.gear_set_id = itemVal;
        gearObj.weapon_id = null;
      }
      gearItems.push(gearObj);
    }
  });

  return { buildName, calibrationId, cradleItems, abilities, gearItems };
}

// Update Build
async function updateBuild() {
  if (!currentBuildId) {
    alert('No build selected to update.');
    return;
  }

  const formData = collectFormData();
  if (!formData) return;

  const { buildName, calibrationId, cradleItems, abilities, gearItems } = formData;

  try {
    // 1. Update Build Details
    const { error: buildError } = await supabaseClient
      .from('builds')
      .update({ build_name: buildName, calibration_id: calibrationId })
      .eq('id', currentBuildId);

    if (buildError) throw buildError;

    // 2. Update Related Tables (Delete all and Re-insert strategy is simplest for full update)

    // Delete existing
    await Promise.all([
      supabaseClient.from('build_cradle').delete().eq('build_id', currentBuildId),
      supabaseClient.from('build_ability_assignment').delete().eq('build_id', currentBuildId),
      supabaseClient.from('build_gear').delete().eq('build_id', currentBuildId)
    ]);

    // Prepare payloads
    const cradlePayload = cradleItems.map(item => ({
      build_id: currentBuildId,
      cradle_item_id: item.cradle_item_id,
      item_slot: item.slot_number
    }));

    const gearPayload = gearItems.map(item => ({
      build_id: currentBuildId,
      ...item
    }));

    const abilityPayload = abilities.map(ability => ({
      build_id: currentBuildId,
      ability_master_id: ability.ability_id,
      ability_rank: ability.rank
    }));

    // Insert new data
    const promises = [];
    if (cradlePayload.length > 0) promises.push(supabaseClient.from('build_cradle').insert(cradlePayload));
    if (gearPayload.length > 0) promises.push(supabaseClient.from('build_gear').insert(gearPayload));
    if (abilityPayload.length > 0) promises.push(supabaseClient.from('build_ability_assignment').insert(abilityPayload));

    await Promise.all(promises);

    alert('Build updated successfully!');
    window.location.href = 'index.html';

  } catch (err) {
    console.error('Error updating build:', err);
    alert('Failed to update build. Check console for details.');
  }
}

// Expose to window
window.updateBuild = updateBuild;

// Start
initForm();
