import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase utilisé côté navigateur (dans les composants "client").
 * À utiliser quand une interaction utilisateur déclenche un appel
 * à la base de données depuis le navigateur (ex: un formulaire).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
