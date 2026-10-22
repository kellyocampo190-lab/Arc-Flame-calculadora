import { LogoutButton } from "@/components/logout-button";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-start justify-between gap-6 border-b border-amber-800/30 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
              Arc &amp; Flame
            </p>

            <h1 className="mt-2 font-serif text-4xl text-amber-100">
              Dashboard
            </h1>

            <p className="mt-2 text-stone-400">
              Costing and quotation management
            </p>
          </div>

          <LogoutButton />
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <p className="text-sm text-stone-400">Cost calculator</p>

            <h2 className="mt-2 text-xl font-semibold text-amber-100">
              Create a calculation
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-400">
              Calculate materials, labour, expenses and the recommended selling
              price.
            </p>
          </article>

          <article className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <p className="text-sm text-stone-400">Quotations</p>

            <h2 className="mt-2 text-xl font-semibold text-amber-100">
              Prepare a quotation
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-400">
              Create and manage customer quotations for personalised pieces.
            </p>
          </article>

          <article className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <p className="text-sm text-stone-400">Materials</p>

            <h2 className="mt-2 text-xl font-semibold text-amber-100">
              Manage material prices
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-400">
              Keep material information and prices available for calculations.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}