import Link from "next/link";
import { connection } from "next/server";

import { CostCalculatorForm } from "@/components/cost-calculator-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewCalculationPage() {
  await connection();

  const supabase = await createClient();

  const { data: materials, error } = await supabase
    .from("materials")
    .select(
      "id, name, unit, unit_cost, is_active, updated_at",
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Unable to load materials: ${error.message}`,
    );
  }

  const activeMaterials = (materials ?? []).map(
    ({ id, name, unit, unit_cost }) => ({
      id,
      name,
      unit,
      unit_cost,
    }),
  );

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-5 inline-block text-sm font-medium text-amber-800 hover:text-amber-950"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Arc & Flame
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            New cost calculation
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Calculate the materials, labour, expenses, fees
            and recommended selling price for a piece of
            jewellery.
          </p>
        </div>

        <CostCalculatorForm
          materials={activeMaterials}
        />
      </div>
    </main>
  );
}