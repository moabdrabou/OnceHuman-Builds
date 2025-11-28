// Supabase Initialization handled in config.js


// Icons (Simple SVGs)
const icons = {
  "Helmet": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a7 7 0 0 0-7 7v4l7 5 7-5v-4a7 7 0 0 0-7-7z"></path></svg>',
  "Jacket": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.4a1.6 1.6 0 0 0-1.58-.68l-4.94 1.06a1.2 1.2 0 0 1-1.12-.34L12 3l-.74.44a1.2 1.2 0 0 1-1.12.34L5.2 2.72a1.6 1.6 0 0 0-1.58.68L2 7l5 3v11h10V10l5-3z"></path></svg>',
  "Pants": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--highlight)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2H8a2 2 0 0 0-2 2v18h4v-7h4v7h4V4a2 2 0 0 0-2-2z"></path></svg>',
  "Boots": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V12l-5-5H9L4 12v8a2 2 0 0 0 0 2z"></path></svg>',
  "Gloves": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>',
  "Mask": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2z"></path></svg>',
  "Weapon": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line></svg>'
};

// DOM Elements
const selector = document.getElementById('build-selector');
const displayPanel = document.getElementById('build-details');
const loadingMessage = document.getElementById('loading-message');

let buildsData = [];

// Fetch Builds from Supabase
async function fetchBuilds() {
  try {
    // Fetch all builds
    const { data: buildsData, error: buildsError } = await supabaseClient
      .from('builds')
      .select('*');

    if (buildsError) {
      console.error('Error fetching builds:', buildsError);
      loadingMessage.textContent = 'Error loading builds. Please check console.';
      return [];
    }

    if (!buildsData || buildsData.length === 0) {
      console.log('No builds found');
      return [];
    }

    // Fetch all master lists for mapping
    const [gearSets, weapons, mods, hides, calibrations, cradleItems, abilityMaster] = await Promise.all([
      supabaseClient.from('gear_set_master_list').select('id, set_name'),
      supabaseClient.from('weapon_master_list').select('id, weapon_name'),
      supabaseClient.from('mod_master_list').select('id, mod_name'),
      supabaseClient.from('hide_master_list').select('id, material_name'),
      supabaseClient.from('calibration').select('id, name'),
      supabaseClient.from('cradle_master_list').select('id, item_name'),
      supabaseClient.from('ability_master_list').select('id, ability_name')
    ]);

    const gearSetMap = Object.fromEntries((gearSets.data || []).map(g => [g.id, g.set_name]));
    const weaponMap = Object.fromEntries((weapons.data || []).map(w => [w.id, w.weapon_name]));
    const modMap = Object.fromEntries((mods.data || []).map(m => [m.id, m.mod_name]));
    const hideMap = Object.fromEntries((hides.data || []).map(h => [h.id, h.material_name]));
    const calibrationMap = Object.fromEntries((calibrations.data || []).map(c => [c.id, c.name]));
    const cradleMap = Object.fromEntries((cradleItems.data || []).map(c => [c.id, c.item_name]));
    const abilityMap = Object.fromEntries((abilityMaster.data || []).map(a => [a.id, a.ability_name]));

    // For each build, fetch its gear and cradle
    const enrichedBuilds = await Promise.all(buildsData.map(async (build) => {
      const [gearResult, cradleResult, abilityResult] = await Promise.all([
        supabaseClient.from('build_gear').select('*').eq('build_id', build.id),
        supabaseClient.from('build_cradle').select('*').eq('build_id', build.id),
        supabaseClient.from('build_ability_assignment').select('*').eq('build_id', build.id)
      ]);

      const gear = (gearResult.data || []).map(g => {
        const isWeapon = g.slot_name && (g.slot_name.includes('weapon') || g.slot_name === 'melee');
        return {
          slot: g.slot_name,
          hide: isWeapon ? '-' : (hideMap[g.hide_material_id] || 'N/A'),
          item: gearSetMap[g.gear_set_id] || weaponMap[g.weapon_id] || 'N/A',
          mod: modMap[g.mod_id] || 'N/A'
        };
      });

      const cradle = (cradleResult.data || []).map(c => cradleMap[c.cradle_item_id] || 'N/A');
      const abilities = (abilityResult.data || []).map(a => abilityMap[a.ability_master_id] || 'N/A');

      return {
        id: build.id,
        name: build.build_name,
        calibration: calibrationMap[build.calibration_id] || 'N/A',
        cradle: cradle,
        gear: gear,
        abilities: abilities
      };
    }));

    console.log('Fetched builds:', enrichedBuilds);
    return enrichedBuilds;
  } catch (err) {
    console.error('Unexpected error:', err);
    loadingMessage.textContent = 'Unexpected error loading builds.';
    return [];
  }
}

// Admin Login & UI Logic
const adminLoginLink = document.getElementById('admin-login-link');
const loginModal = document.getElementById('login-modal');
const closeModal = document.getElementById('close-modal');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const addBuildBtn = document.getElementById('add-build-btn');
const deleteBuildBtn = document.getElementById('delete-build-btn');
const requestDataBtn = document.getElementById('request-data-btn');

// Show Modal
adminLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.classList.remove('hidden');
});

// Hide Modal
closeModal.addEventListener('click', () => {
  loginModal.classList.add('hidden');
  loginError.textContent = '';
  loginForm.reset();
});

// Close modal if clicking outside
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.classList.add('hidden');
    loginError.textContent = '';
    loginForm.reset();
  }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  loginError.textContent = 'Logging in...';

  console.log('=== LOGIN ATTEMPT ===');
  console.log('Email:', email);

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    console.log('Login response:', { data, error });

    if (error) throw error;

    console.log('Login successful! User:', data.user.email);
    console.log('Session:', data.session);
    console.log('Session stored? Check localStorage:', localStorage.getItem('supabase.auth.token'));

    // Check Role
    const isAdmin = await checkUserRole(data.user);
    console.log('Is Admin?', isAdmin);

    if (isAdmin) {
      loginModal.classList.add('hidden');
      loginForm.reset();
      updateUIBasedOnRole(true);

      // Verify session one more time before showing success
      const { data: sessionCheck } = await supabaseClient.auth.getSession();
      console.log('Session after login:', sessionCheck.session);

      alert('Logged in as Admin');
    } else {
      throw new Error('Not authorized as Admin');
    }

  } catch (err) {
    console.error('Login error:', err);
    loginError.textContent = err.message || 'Login failed';
    // Optional: Sign out if role check failed
    if (err.message === 'Not authorized as Admin') {
      await supabaseClient.auth.signOut();
    }
  }
});

// Check User Role
async function checkUserRole(user) {
  if (!user) return false;

  console.log('Checking role for user:', user.email);
  console.log('User Metadata:', user.user_metadata);

  // 1. Check user_metadata for is_admin flag
  if (user.user_metadata && user.user_metadata.is_admin === true) {
    console.log('User is admin (metadata)');
    return true;
  }

  // 2. Fallback: Check hardcoded admin email
  const HARDCODED_ADMIN_EMAIL = 'onceh6793@gmail.com';
  if (user.email === HARDCODED_ADMIN_EMAIL) {
    console.log('User is admin (email match)');
    return true;
  }

  console.log('User is NOT admin');
  return false;
}

// Update UI
function updateUIBasedOnRole(isAdmin) {
  if (isAdmin) {
    adminLoginLink.textContent = 'Logout';
    adminLoginLink.onclick = handleLogout; // Change click handler

    addBuildBtn.classList.remove('hidden');
    deleteBuildBtn.classList.remove('hidden');

    // Hide Request button for admins
    requestDataBtn.classList.add('hidden');

  } else {
    adminLoginLink.textContent = 'Admin Login';
    adminLoginLink.onclick = (e) => { // Reset click handler
      e.preventDefault();
      loginModal.classList.remove('hidden');
    };

    addBuildBtn.classList.add('hidden');
    deleteBuildBtn.classList.add('hidden');

    // Show Request button for non-admins
    requestDataBtn.classList.remove('hidden');
  }
}

async function handleLogout(e) {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  updateUIBasedOnRole(false);
  alert('Logged out');
}

// Initialize
async function init() {
  console.log('Initializing build viewer...');

  // Check current session
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    const isAdmin = await checkUserRole(session.user);
    updateUIBasedOnRole(isAdmin);
  } else {
    updateUIBasedOnRole(false);
  }

  // Reset dropdown to default and hide details panel
  selector.value = '';
  displayPanel.classList.add('hidden');

  buildsData = await fetchBuilds();
  console.log('Builds loaded:', buildsData.length);

  // Hide loading message
  loadingMessage.classList.add('hidden');

  // Populate Dropdown
  buildsData.forEach(build => {
    const option = document.createElement('option');
    option.value = build.id;
    option.textContent = build.name;
    selector.appendChild(option);
  });

  console.log('Dropdown populated with', buildsData.length, 'builds');
}

// Helper function to format slot names
function formatSlotName(slot) {
  if (!slot) return '';
  // Replace underscores with spaces and capitalize each word
  return slot
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Render Functioner
selector.addEventListener('change', (e) => {
  const selectedId = e.target.value;
  const build = buildsData.find(b => b.id === selectedId);

  if (build) {
    renderBuild(build);
    displayPanel.classList.remove('hidden');
  }
});

// Render Function
function renderBuild(build) {
  // Calibration
  const calibrationDiv = document.getElementById('d-calibration');
  calibrationDiv.textContent = build.calibration || 'N/A';

  // Cradle List
  const cradleList = document.getElementById('d-cradle');
  cradleList.innerHTML = '';
  if (build.cradle && build.cradle.length > 0) {
    build.cradle.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      cradleList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No cradle items';
    cradleList.appendChild(li);
  }

  // Abilities List
  const abilitiesList = document.getElementById('d-abilities');
  abilitiesList.innerHTML = '';
  if (build.abilities && build.abilities.length > 0) {
    build.abilities.forEach(ability => {
      const li = document.createElement('li');
      li.textContent = ability;
      abilitiesList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No abilities';
    abilitiesList.appendChild(li);
  }

  // Gear Table
  const gearBody = document.getElementById('d-gear');
  gearBody.innerHTML = '';
  if (build.gear) {
    build.gear.forEach(item => {
      const row = document.createElement('tr');

      // Get Icon
      // Normalize slot name to match keys (e.g. "Weapon 1" -> "Weapon")
      let iconKey = item.slot;
      if (item.slot && item.slot.includes('Weapon')) iconKey = 'Weapon';

      const iconSvg = icons[iconKey] || '';

      row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${iconSvg}
                    <span>${formatSlotName(item.slot)}</span>
                </div>
            </td>
            <td>${item.hide}</td>
            <td>${item.item}</td>
            <td>${item.mod}</td>
        `;
      gearBody.appendChild(row);
    });
  }
}

// Start Initialization
init();
