import { createClient } from '@supabase/supabase-js'

let _client = null

export function getDb() {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY
  if (url && key) {
    _client = createClient(url, key)
  }
  return _client
}

export function isDbConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY),
  )
}
