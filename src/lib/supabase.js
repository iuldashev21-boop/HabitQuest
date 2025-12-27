import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log environment variables (without exposing full key)
console.log('[Supabase Config]', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  keyLength: supabaseAnonKey?.length,
  isJWT: supabaseAnonKey?.startsWith('eyJ')
});

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
}

// Warning if key doesn't look like a JWT (Supabase anon keys are JWTs)
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
  console.warn('[Supabase] WARNING: VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT!');
  console.warn('Supabase anon keys should start with "eyJ". Current key starts with:', supabaseAnonKey.substring(0, 15));
  console.warn('Please check your .env file and get the correct anon key from Supabase dashboard.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
