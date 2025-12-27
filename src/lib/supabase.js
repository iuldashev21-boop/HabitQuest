import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only log debug info in development mode
if (import.meta.env.DEV) {
  // Debug: Log environment variables (only show first 7 chars for security)
  console.log('[Supabase Config]', {
    url: supabaseUrl,
    keyPrefix: supabaseAnonKey?.substring(0, 7) + '...',
    keyLength: supabaseAnonKey?.length,
    isJWT: supabaseAnonKey?.startsWith('eyJ')
  });
}

// Validate configuration (always check, but only warn in dev)
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.error('[Supabase] Missing environment variables!');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
  }
}

// Warning if key doesn't look like a JWT (Supabase anon keys are JWTs)
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
  // Always warn about invalid key format (this is a critical config issue)
  console.warn('[Supabase] WARNING: VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT!');
  console.warn('Supabase anon keys should start with "eyJ". Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
