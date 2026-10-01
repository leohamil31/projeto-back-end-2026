import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

const getClient = (): SupabaseClient | null => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
};

export const isSupabaseConfigured = (): boolean => Boolean(getClient());

export const requireSupabaseClient = (): SupabaseClient => {
  const supabase = getClient();
  if (!supabase) throw new Error('Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  return supabase;
};
