import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import QuotationForm from "@/components/quotation-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function NewQuotationPage() {
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
        recommended_price,
        delivery_cost,
        created_at
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const calculations = (data ?? []).map((calculation) => ({
    id: calculation.id,
    pieceName: calculation.piece_name,
    recommendedPrice: Number(
      calculation.recommended_price ?? 0,
    ),
    deliveryCost: Number(calculation.delivery_cost ?? 0),
    createdAt: calculation.created_at,
  }));

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-stone-200 pb-8">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-amber-800 transition hover:text-amber-950"
          >
            ← Back to dashboard
          </Link>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Arc & Flame
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create a quotation
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Select a saved calculation, enter the customer’s
            information and prepare a professional quotation.
          </p>
        </header>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            The saved calculations could not be loaded:{" "}
            {error.message}
          </div>
        )}

        <section className="mt-8">
          <QuotationForm calculations={calculations} />
        </section>
      </div>
    </main>
  );
}