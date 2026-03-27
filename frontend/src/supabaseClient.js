import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.startsWith('http') 
  ? import.meta.env.VITE_SUPABASE_URL 
  : 'https://ixkuxjijyzrkwqfmxkzi.supabase.co';
  
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'sua_supabase_anon_key'
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
