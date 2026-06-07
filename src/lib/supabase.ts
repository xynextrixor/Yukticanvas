import { createClient } from "@supabase/supabase-js";

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('SUPABASE_URL') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('SUPABASE_ANON_KEY') : null;

export const supabaseUrl = envUrl || localUrl || "";
export const supabaseAnonKey = envKey || localKey || "";

export const hasValidCredentials = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('use_mock_db') === 'true') {
    return false;
  }
  return supabaseUrl.startsWith('http') && 
         supabaseAnonKey.length > 20 &&
         !supabaseUrl.includes('placeholder') &&
         !supabaseUrl.includes('your-project');
};

export const supabase = createClient(
  hasValidCredentials() ? supabaseUrl.replace(/\/$/, '') : "https://placeholder.supabase.co", 
  hasValidCredentials() ? supabaseAnonKey : "placeholder",
  {
    auth: {
      autoRefreshToken: hasValidCredentials(),
      persistSession: hasValidCredentials(),
      detectSessionInUrl: hasValidCredentials()
    }
  }
);

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', key);
  localStorage.removeItem('use_mock_db');
  window.location.reload();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('SUPABASE_URL');
  localStorage.removeItem('SUPABASE_ANON_KEY');
  localStorage.removeItem('use_mock_db');
  window.location.reload();
};
