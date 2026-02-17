
import { createClient } from '@supabase/supabase-js';

// Accessing process.env via the window shim provided in index.html
const env = (window as any).process?.env || {};

const supabaseUrl = env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
