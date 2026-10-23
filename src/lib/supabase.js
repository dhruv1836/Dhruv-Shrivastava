import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidSupabaseUrl = (value) => {
  if (typeof value !== 'string' || !value.trim() || /YOUR_PROJECT_REF|your-project-url-here/i.test(value)) return false
  try {
    const parsed = new URL(value.trim())
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

const hasPublicKey = typeof anonKey === 'string' && Boolean(anonKey.trim()) && !/^your[-_ ]/i.test(anonKey.trim())

// The admin email allowed to edit content. Kept here only for UI hints;
// real enforcement happens in the database via Row Level Security (RLS).
export const ADMIN_EMAIL = 'dhruvshrivastava1803@gmail.com'

// If env vars are missing we run in read-only "demo" mode so the site
// still renders locally without a backend configured.
export const isConfigured = isValidSupabaseUrl(url) && hasPublicKey

export const supabase = isConfigured
  ? createClient(url.trim(), anonKey.trim())
  : null
