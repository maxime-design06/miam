import { signIn } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="max-w-sm w-full mx-auto px-6 py-24">
      <h1 className="font-display text-2xl text-papaya mb-8 text-center">miam admin</h1>
      {error && (
        <p className="text-sm text-papaya mb-4 text-center">
          Email ou mot de passe incorrect.
        </p>
      )}
      <form action={signIn} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="email"
          required
          className="w-full h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
        />
        <input
          type="password"
          name="password"
          placeholder="mot de passe"
          required
          className="w-full h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
        />
        <button
          type="submit"
          className="w-full h-10 rounded-full bg-leaf text-cream text-sm font-display"
        >
          se connecter
        </button>
      </form>
    </main>
  );
}
