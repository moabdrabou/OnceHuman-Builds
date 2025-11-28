const SUPABASE_URL = 'https://fjyfuigdesprdtveqnjz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWZ1aWdkZXNwcmR0dmVxbmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDE3MDMsImV4cCI6MjA3OTc3NzcwM30.B1rQAGRJjWmTnN2eX8RcwlppsoYyEl5Th2syyLbcjig';

// Create Supabase client with explicit session persistence
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token'
  }
});

// Wait for session to be restored from localStorage
let sessionReady = new Promise((resolve) => {
  // Give the client a moment to restore the session
  setTimeout(async () => {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) console.error('Config.js - Session error:', error);
    console.log('Config.js - Session loaded:', {
      hasSession: !!data.session,
      userId: data.session?.user?.id,
      email: data.session?.user?.email
    });
    resolve(data.session);
  }, 100); // 100ms delay to allow localStorage read
});
