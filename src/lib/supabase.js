import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only log debug info in development mode (security: don't expose config in production)
if (import.meta.env.DEV) {
  console.log('[Supabase Config]', {
    url: supabaseUrl,
    keyPrefix: supabaseAnonKey?.substring(0, 7) + '...',
    keyLength: supabaseAnonKey?.length,
    isJWT: supabaseAnonKey?.startsWith('eyJ')
  });
}

// Validate configuration - fail fast if missing
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  throw new Error(`[Supabase] Missing required environment variables: ${missing.join(', ')}. Check your .env file.`);
}

// Warning if key doesn't look like a JWT (Supabase anon keys are JWTs)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.warn('[Supabase] WARNING: VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT!');
  console.warn('Supabase anon keys should start with "eyJ". Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
