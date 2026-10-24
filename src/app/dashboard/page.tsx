import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Arc & Flame
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Dashboard
            </h1>

            <p className="mt-3 text-base text-stone-600">
              Costing and quotation management
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl border border-amber-700 bg-white px-5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Materials */}
          <Link
            href="/materials"
            className="group flex min-h-72 flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-stone-500">
                Materials
              </p>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Available
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-stone-900 group-hover:text-amber-800">
              Save materials
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Register materials, units and prices so they can be
              used in future calculations.
            </p>

            <p className="mt-auto pt-7 text-sm font-semibold text-amber-800">
              Manage materials →
            </p>
          </Link>

          {/* 2. Cost calculator */}
          <Link
            href="/calculations/new"
            className="group flex min-h-72 flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-stone-500">
                Cost calculator
              </p>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Available
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-stone-900 group-hover:text-amber-800">
              Calculate costs
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Calculate materials, labour, expenses and the
              recommended selling price.
            </p>

            <p className="mt-auto pt-7 text-sm font-semibold text-amber-800">
              Open calculator →
            </p>
          </Link>

          {/* 3. New quotation */}
          <Link
            href="/quotations/new"
            className="group flex min-h-72 flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-stone-500">
                New quotation
              </p>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Available
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-stone-900 group-hover:text-amber-800">
              Prepare a quotation
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Prepare a customer quotation using a saved calculation
              and optional one-off custom costs.
            </p>

            <p className="mt-auto pt-7 text-sm font-semibold text-amber-800">
              Create quotation →
            </p>
          </Link>

          {/* 4. Calculation history */}
          <Link
            href="/calculations"
            className="group flex min-h-72 flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-stone-500">
                Calculation history
              </p>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Available
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-stone-900 group-hover:text-amber-800">
              Saved calculations
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Review previous calculations and their complete
              costing information.
            </p>

            <p className="mt-auto pt-7 text-sm font-semibold text-amber-800">
              View calculations →
            </p>
          </Link>

          {/* 5. Quotation history */}
          <Link
            href="/quotations"
            className="group flex min-h-72 flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-stone-500">
                Quotation history
              </p>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Available
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-stone-900 group-hover:text-amber-800">
              Saved quotations
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Review customer quotations, prices, custom costs and
              contact information.
            </p>

            <p className="mt-auto pt-7 text-sm font-semibold text-amber-800">
              View quotations →
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}