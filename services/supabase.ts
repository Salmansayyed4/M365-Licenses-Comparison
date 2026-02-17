import { createClient } from '@supabase/supabase-js';

// Fallback to placeholders to prevent 'supabaseUrl is required' error during initialization
// in environments where environment variables are not yet configured.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
