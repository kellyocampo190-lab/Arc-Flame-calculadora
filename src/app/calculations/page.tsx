import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

type Calculation = {
  id: string;
  piece_name: string;
  sales_channel: string;
  channel_name: string | null;
  production_cost: number | string;
  recommended_price: number | string;
  estimated_profit: number | string;
  created_at: string;
};

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatChannel(value: string) {
  const channelNames: Record<string, string> = {
    direct: "Direct sale",
    own_website: "Own website",
    online_marketplace: "Online marketplace",
    physical_display: "Physical display",
    market_event: "Market or event",
    other: "Other",
  };

  return channelNames[value] ?? value.replaceAll("_", " ");
}

export default async function CalculationsPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("calculations")
    .select(
      `
        id,
        piece_name,
        sales_channel,
        channel_name,
        production_cost,
        recommended_price,
        estimated_profit,
        created_at
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const calculations = (data ?? []) as Calculation[];

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-amber-800 hover:text-amber-950"
            >
              ← Back to dashboard
            </Link>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Arc & Flame
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Calculation history
            </h1>

            <p className="mt-3 text-stone-600">
              Review previously saved jewellery calculations.
            </p>
          </div>

          <Link
            href="/calculations/new"
            className="inline-flex w-fit justify-center rounded-xl bg-amber-700 px-5 py-3 font-semibold text-white transition hover:bg-amber-800"
          >
            New calculation
          </Link>
        </header>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            The calculations could not be loaded: {error.message}
          </div>
        ) : calculations.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No saved calculations yet
            </h2>

            <p className="mt-3 text-stone-600">
              Create and save your first calculation to see it here.
            </p>

            <Link
              href="/calculations/new"
              className="mt-6 inline-flex rounded-xl bg-amber-700 px-5 py-3 font-semibold text-white hover:bg-amber-800"
            >
              Create calculation
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calculations.map((calculation) => (
              <Link
                key={calculation.id}
                href={`/calculations/${calculation.id}`}
                className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-stone-500">
                    {formatDate(calculation.created_at)}
                  </p>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Saved
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-stone-900 group-hover:text-amber-800">
                  {calculation.piece_name}
                </h2>

                <p className="mt-2 text-sm text-stone-600">
                  {calculation.channel_name?.trim() ||
                    formatChannel(calculation.sales_channel)}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-stone-200 pt-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Production cost
                    </p>

                    <p className="mt-2 font-semibold text-stone-900">
                      {formatCurrency(calculation.production_cost)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Selling price
                    </p>

                    <p className="mt-2 text-xl font-semibold text-amber-800">
                      {formatCurrency(calculation.recommended_price)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm text-stone-600">
                    Profit:{" "}
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(calculation.estimated_profit)}
                    </span>
                  </p>

                  <p className="text-sm font-semibold text-amber-800">
                    View details →
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}