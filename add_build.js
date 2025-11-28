// Supabase Initialization
const SUPABASE_URL = 'https://fjyfuigdesprdtveqnjz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWZ1aWdkZXNwcmR0dmVxbmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDE3MDMsImV4cCI6MjA3OTc3NzcwM30.B1rQAGRJjWmTnN2eX8RcwlppsoYyEl5Th2syyLbcjig';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const calibrationSelect = document.getElementById('calibration-select');
const cradleContainer = document.getElementById('cradle-container');
const abilitiesContainer = document.getElementById('abilities-container');

// Fetch Options from DB
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

    if (calibrationRes.error) console.error('Error fetching calibration:', calibrationRes.error);
    if (cradleRes.error) console.error('Error fetching cradle items:', cradleRes.error);
    if (abilityRes.error) console.error('Error fetching abilities:', abilityRes.error);
    if (hideRes.error) console.error('Error fetching hide options:', hideRes.error);
    if (modRes.error) console.error('Error fetching mod options:', modRes.error);
    if (gearSetRes.error) console.error('Error fetching gear sets:', gearSetRes.error);
    if (allWeaponsRes.error) console.error('Error fetching all weapons:', allWeaponsRes.error);

    // Log the raw weapon data for debugging
    console.log('All weapons data from database:', allWeaponsRes.data);

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

// Populate Dropdowns
function populateDropdown(selectElement, items, valueKey, textKey, placeholder) {
  selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueKey];
    option.textContent = item[textKey];
    selectElement.appendChild(option);
  });
}

// Initialize Form
async function initForm() {
  const data = await fetchOptions();

  // Populate Calibration
  if (calibrationSelect) {
    populateDropdown(calibrationSelect, data.calibrations, 'id', 'name', '-- Select Calibration --');
  }

  // Populate Cradle (8 slots)
  if (cradleContainer) {
    cradleContainer.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group';
      const label = document.createElement('label');
      label.textContent = `Cradle Slot ${i}`;
      const select = document.createElement('select');
      select.name = `cradle_${i}`;
      populateDropdown(select, data.cradleItems, 'id', 'item_name', `-- Select Cradle Item ${i} --`);

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      cradleContainer.appendChild(wrapper);
    }
  }

  // Populate Abilities (3 slots)
  if (abilitiesContainer) {
    abilitiesContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group';
      const label = document.createElement('label');
      label.textContent = `Ability ${i}`;
      const select = document.createElement('select');
      select.name = `ability_${i}`;
      populateDropdown(select, data.abilities, 'id', 'ability_name', `-- Select Ability ${i} --`);

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      abilitiesContainer.appendChild(wrapper);
    }
  }

  // Populate Hide Dropdowns
  const hideSelects = document.querySelectorAll('.hide-select');
  hideSelects.forEach(select => {
    populateDropdown(select, data.hideOptions, 'id', 'material_name', '-- Select Hide --');
  });

  // Populate Mod Dropdowns
  const modSelects = document.querySelectorAll('.mod-select');
  modSelects.forEach(select => {
    populateDropdown(select, data.modOptions, 'id', 'mod_name', '-- Select Mod --');
  });

  // Populate Gear Item Dropdowns
  const gearItemSelects = document.querySelectorAll('.gear-item-select');
  gearItemSelects.forEach(select => {
    populateDropdown(select, data.gearSets, 'id', 'set_name', '-- Select Gear Set --');
  });

  // Populate Weapon Dropdowns
  const weapon1Select = document.getElementById('item_weapon_1');
  const weapon2Select = document.getElementById('item_weapon_2');
  if (weapon1Select) {
    populateDropdown(weapon1Select, data.weapons, 'id', 'weapon_name', '-- Select Weapon --');
  }
  if (weapon2Select) {
    populateDropdown(weapon2Select, data.weapons, 'id', 'weapon_name', '-- Select Weapon --');
  }

  // Populate Melee Dropdown
  const meleeSelect = document.getElementById('item_melee');
  if (meleeSelect) {
    populateDropdown(meleeSelect, data.meleeWeapons, 'id', 'weapon_name', '-- Select Melee Weapon --');
  }
}

// Collect Form Data
function collectFormData() {
  const buildName = document.getElementById('build-name').value;
  const calibrationId = document.getElementById('calibration-select').value;

  if (!buildName || !calibrationId) {
    alert('Please fill in Build Name and Calibration.');
    return null;
  }

  // Cradle Items
  const cradleItems = [];
  for (let i = 1; i <= 8; i++) {
    const val = document.querySelector(`select[name="cradle_${i}"]`).value;
    if (val) cradleItems.push({ slot_number: i, cradle_item_id: val });
  }

  // Abilities
  const abilities = [];
  for (let i = 1; i <= 3; i++) {
    const val = document.querySelector(`select[name="ability_${i}"]`).value;
    if (val) abilities.push({ ability_id: val, rank: i });
  }

  // Gear Items
  const gearItems = [];
  const slots = ['helmet', 'jacket', 'pants', 'boots', 'gloves', 'mask', 'weapon_1', 'weapon_2', 'melee'];

  slots.forEach(slot => {
    const isWeapon = slot.includes('weapon') || slot === 'melee';
    const itemVal = document.querySelector(`select[name="item_${slot}"]`)?.value;
    const modVal = document.querySelector(`select[name="mod_${slot}"]`)?.value;
    // Hide is only for armor
    const hideVal = !isWeapon ? document.querySelector(`select[name="hide_${slot}"]`)?.value : null;

    if (itemVal) {
      const gearObj = {
        slot_name: slot, // You might need to capitalize or format this to match DB enum if strictly enforced
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

// Save Build
async function saveBuild() {
  const formData = collectFormData();
  if (!formData) return;

  const { buildName, calibrationId, cradleItems, abilities, gearItems } = formData;

  try {
    // 1. Insert Build
    const { data: buildData, error: buildError } = await supabaseClient
      .from('builds')
      .insert([{ build_name: buildName, calibration_id: calibrationId }])
      .select()
      .single();

    if (buildError) throw buildError;
    const buildId = buildData.id;

    // 2. Prepare Cradle Data
    const cradlePayload = cradleItems.map(item => ({
      build_id: buildId,
      cradle_item_id: item.cradle_item_id,
      item_slot: item.slot_number
    }));

    // 3. Prepare Gear Data
    const gearPayload = gearItems.map(item => ({
      build_id: buildId,
      ...item
    }));

    // 4. Prepare Ability Data
    const abilityPayload = abilities.map(ability => ({
      build_id: buildId,
      ability_master_id: ability.ability_id,
      ability_rank: ability.rank
    }));

    // 5. Insert Details
    const promises = [];
    if (cradlePayload.length > 0) {
      console.log('Saving cradle items:', cradlePayload);
      promises.push(
        supabaseClient.from('build_cradle').insert(cradlePayload).then(result => {
          if (result.error) {
            console.error('Error saving cradle:', result.error);
            throw result.error;
          }
          console.log('Cradle saved successfully');
          return result;
        })
      );
    } else {
      console.log('No cradle items to save');
    }

    if (gearPayload.length > 0) {
      console.log('Saving gear items:', gearPayload);
      promises.push(
        supabaseClient.from('build_gear').insert(gearPayload).then(result => {
          if (result.error) {
            console.error('Error saving gear:', result.error);
            throw result.error;
          }
          console.log('Gear saved successfully');
          return result;
        })
      );
    } else {
      console.log('No gear items to save');
    }

    if (abilityPayload.length > 0) {
      console.log('Saving abilities:', abilityPayload);
      promises.push(
        supabaseClient.from('build_ability_assignment').insert(abilityPayload).then(result => {
          if (result.error) {
            console.error('Error saving abilities:', result.error);
            throw result.error;
          }
          console.log('Abilities saved successfully');
          return result;
        })
      );
    } else {
      console.log('No abilities to save');
    }

    await Promise.all(promises);

    alert('Build saved successfully!');
    window.location.href = 'index.html'; // Redirect to home

  } catch (err) {
    console.error('Error saving build:', err);
    alert('Failed to save build. Check console for details.');
  }
}

// Expose to window for button onclick
window.saveBuild = saveBuild;

// Start
initForm();
