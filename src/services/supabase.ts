import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();
const supabaseApiKey = supabaseAnonKey || supabasePublishableKey;

if (!supabaseUrl || !supabaseApiKey) {
  // Keep initialization non-fatal so the app can still compile in local setups.
  console.warn(
    'Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).'
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseApiKey);

export function getSupabaseConfigError(): string | null {
  if (isSupabaseConfigured) {
    return null;
  }

  return 'Supabase is not configured. Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).';
}

export const supabase = createClient(supabaseUrl || '', supabaseApiKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: supabaseApiKey
      ? {
        apikey: supabaseApiKey,
      }
      : {},
  },
});
