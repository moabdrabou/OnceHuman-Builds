// Shared Auth Logic for non-index pages
// (Index page handles its own auth UI in script.js)

document.addEventListener('DOMContentLoaded', async () => {
  // Check if we are on index.html (or root)
  const path = window.location.pathname;
  const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('/');

  console.log('auth.js: Running on path:', path);

  if (isIndex) {
    console.log('auth.js: Skipping index page');
    return;
  }

  // Define protected pages
  const protectedPages = ['add_build.html', 'delete_build.html', 'edit_build.html'];
  const currentPage = path.split('/').pop();
  const isProtected = protectedPages.includes(currentPage);

  const adminLoginLink = document.getElementById('admin-login-link');
  if (!adminLoginLink) {
    console.error('auth.js: Admin login link not found');
    return;
  }

  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.error('auth.js: Error getting session:', error);

  console.log('auth.js: Session found:', !!session);

  // Check if this is a protected page
  if (isProtected) {
    if (!session) {
      alert('⚠️ Access Denied\n\nYou must be logged in to access this page.');
      window.location.href = 'index.html';
      return;
    }

    // Check for is_admin metadata
    const isAdmin = session.user?.user_metadata?.is_admin === true;
    if (!isAdmin) {
      console.log('auth.js: User is logged in but NOT admin. Redirecting...');
      alert('⚠️ Access Denied\n\nYou do not have permission to access this page.');
      window.location.href = 'index.html';
      return;
    }
  }

  if (session) {
    console.log('auth.js: Setting link to Logout');
    adminLoginLink.textContent = 'Logout';
    adminLoginLink.href = '#';
    adminLoginLink.onclick = async (e) => { // Use onclick to ensure we override default
      e.preventDefault();
      await supabaseClient.auth.signOut();
      alert('Logged out');
      window.location.href = 'index.html';
    };
  } else {
    console.log('auth.js: Setting link to Admin Login');
    adminLoginLink.textContent = 'Admin Login';
    adminLoginLink.href = 'index.html';
  }
});
