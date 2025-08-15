import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Use a singleton pattern to ensure only one client instance
let instance = null;

function createSupabaseClient(isAdmin = false) {
  if (instance) {
    return instance;
  }

  // Use service role key for admin operations, anon key for public access
  const key = isAdmin && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey;
  
  instance = createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'admin-auth', // Use a unique storage key
    }
  });

  return instance;
}

// Export a single instance for admin operations
export const supabase = createSupabaseClient(true);
