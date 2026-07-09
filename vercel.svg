import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client Supabase utilisé côté serveur (dans les pages et layouts).
 * C'est celui qu'on utilise le plus souvent : quand Next.js génère
 * une page (par exemple la liste des recettes), il va chercher les
 * données directement sur le serveur avant d'envoyer la page au visiteur.
 * Cela rend le site plus rapide et meilleur pour le référencement (SEO).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le appelé depuis un Server Component qui ne peut pas
            // écrire de cookies : on peut l'ignorer si un middleware
            // gère déjà le rafraîchissement des sessions.
          }
        },
      },
    }
  )
}
