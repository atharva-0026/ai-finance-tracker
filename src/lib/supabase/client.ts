import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wzrqfxbafhemwzhlnfnm.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cnFmeGJhZmhlbXd6aGxuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjQ2MzIsImV4cCI6MjEwODcwMDYzMn0.JYjYso13wmw_i4NiW2FnpSXs6q_DeIHZner_r_EWVS4';

  return createBrowserClient(url, anonKey);
}
