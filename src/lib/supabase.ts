import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize with a fallback empty string if missing, but only call createClient if URL is valid-ish
// Actually createClient needs a valid URL. If empty, we can export a mock or handle it.
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as any);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing or invalid. Using mock client.');
}
