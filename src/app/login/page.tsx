"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("The email address or password is incorrect.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-12 text-stone-100">
      <section className="w-full max-w-md rounded-3xl border border-amber-700/30 bg-stone-900 p-8 shadow-2xl shadow-amber-950/20">
        <header className="mb-8 text-center">
          <div className="mb-4 text-3xl text-amber-500">✦</div>

          <h1 className="font-serif text-3xl tracking-wide text-amber-100">
            Arc &amp; Flame
          </h1>

          <p className="mt-2 text-sm text-stone-400">
            Costing &amp; Quotation Platform
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-stone-300"
              htmlFor="email"
            >
              Email address
            </label>

            <input
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-stone-300"
              htmlFor="password"
            >
              Password
            </label>

            <input
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage && (
            <p
              className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-amber-700 px-4 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-stone-500">
          Private business management tool
        </p>
      </section>
    </main>
  );
}