import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

type CalculationDetails = {
  id: string;
  user_id: string;
  piece_name: string;

  material_cost: number | string;
  labour_hours: number | string;
  hourly_rate: number | string;
  labour_cost: number | string;

  packaging_cost: number | string;
  delivery_cost: number | string;
  other_expenses: number | string;
  production_cost: number | string;

  profit_margin: number | string;

  sales_channel: string;
  channel_name: string | null;

  percentage_fee_rate: number | string;
  percentage_fee_amount: number | string;
  fixed_fee: number | string;
  recurring_cost: number | string;
  expected_sales: number | string;
  allocated_recurring_cost: number | string;
  total_channel_cost: number | string;

  estimated_profit: number | string;
  recommended_price: number | string;

  created_at: string;
};

type CalculationMaterial = {
  id: string;
  calculation_id: string;
  material_id: string;
  material_name: string;
  unit: string;
  unit_cost: number | string;
  quantity: number | string;
  total_cost: number | string;
};

type CalculationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatNumber(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function DetailRow({
  label,
  value,
  emphasised = false,
}: {
  label: string;
  value: string;
  emphasised?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-stone-200 py-4 last:border-b-0">
      <dt className="text-sm text-stone-600">{label}</dt>

      <dd
        className={
          emphasised
            ? "text-lg font-semibold text-amber-800"
            : "text-sm font-semibold text-stone-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export default async function CalculationDetailsPage({
  params,
}: CalculationPageProps) {
  await connection();

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: calculationData, error: calculationError } = await supabase
    .from("calculations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (calculationError || !calculationData) {
    notFound();
  }

  const { data: materialsData, error: materialsError } = await supabase
    .from("calculation_materials")
    .select("*")
    .eq("calculation_id", id)
    .order("material_name", { ascending: true });

  const calculation = calculationData as CalculationDetails;
  const materials = (materialsData ?? []) as CalculationMaterial[];

  const channelDescription =
    calculation.channel_name?.trim() ||
    formatChannel(calculation.sales_channel);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-stone-200 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-amber-800 transition hover:text-amber-950"
              >
                ← Back to dashboard
              </Link>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Saved calculation
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                {calculation.piece_name}
              </h1>

              <p className="mt-3 text-stone-600">
                Created {formatDate(calculation.created_at)}
              </p>
            </div>

            <Link
              href="/calculations/new"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              New calculation
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-500">
              Production cost
            </p>

            <p className="mt-3 text-3xl font-semibold text-stone-900">
              {formatCurrency(calculation.production_cost)}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-500">
              Estimated profit
            </p>

            <p className="mt-3 text-3xl font-semibold text-stone-900">
              {formatCurrency(calculation.estimated_profit)}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-700 bg-amber-800 p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-amber-100">
              Recommended selling price
            </p>

            <p className="mt-3 text-4xl font-semibold">
              {formatCurrency(calculation.recommended_price)}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Materials
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Materials used
            </h2>
          </div>

          {materialsError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              The materials could not be loaded: {materialsError.message}
            </div>
          ) : materials.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-600">
              No materials were found for this calculation.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-sm text-stone-500">
                    <th className="px-3 py-4 font-semibold">Material</th>
                    <th className="px-3 py-4 font-semibold">Unit</th>
                    <th className="px-3 py-4 text-right font-semibold">
                      Unit cost
                    </th>
                    <th className="px-3 py-4 text-right font-semibold">
                      Quantity
                    </th>
                    <th className="px-3 py-4 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-stone-100 last:border-b-0"
                    >
                      <td className="px-3 py-4 font-medium text-stone-900">
                        {material.material_name}
                      </td>

                      <td className="px-3 py-4 text-stone-600">
                        {material.unit}
                      </td>

                      <td className="px-3 py-4 text-right text-stone-700">
                        {formatCurrency(material.unit_cost)}
                      </td>

                      <td className="px-3 py-4 text-right text-stone-700">
                        {formatNumber(material.quantity)}
                      </td>

                      <td className="px-3 py-4 text-right font-semibold text-stone-900">
                        {formatCurrency(material.total_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="border-t border-stone-300 bg-stone-50">
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-right font-semibold text-stone-700"
                    >
                      Total material cost
                    </td>

                    <td className="px-3 py-4 text-right text-lg font-semibold text-amber-800">
                      {formatCurrency(calculation.material_cost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Production
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Labour and other expenses
            </h2>

            <dl className="mt-5">
              <DetailRow
                label="Labour hours"
                value={`${formatNumber(calculation.labour_hours)} hours`}
              />

              <DetailRow
                label="Hourly rate"
                value={formatCurrency(calculation.hourly_rate)}
              />

              <DetailRow
                label="Labour cost"
                value={formatCurrency(calculation.labour_cost)}
              />

              <DetailRow
                label="Packaging"
                value={formatCurrency(calculation.packaging_cost)}
              />

              <DetailRow
                label="Delivery"
                value={formatCurrency(calculation.delivery_cost)}
              />

              <DetailRow
                label="Other expenses"
                value={formatCurrency(calculation.other_expenses)}
              />

              <DetailRow
                label="Total production cost"
                value={formatCurrency(calculation.production_cost)}
                emphasised
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Sales channel
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {channelDescription}
            </h2>

            <dl className="mt-5">
              <DetailRow
                label="Channel type"
                value={formatChannel(calculation.sales_channel)}
              />

              <DetailRow
                label="Percentage fee"
                value={`${formatNumber(
                  calculation.percentage_fee_rate,
                )}%`}
              />

              <DetailRow
                label="Percentage fee amount"
                value={formatCurrency(
                  calculation.percentage_fee_amount,
                )}
              />

              <DetailRow
                label="Fixed fee"
                value={formatCurrency(calculation.fixed_fee)}
              />

              <DetailRow
                label="Recurring cost"
                value={formatCurrency(calculation.recurring_cost)}
              />

              <DetailRow
                label="Expected sales"
                value={formatNumber(calculation.expected_sales)}
              />

              <DetailRow
                label="Recurring cost per sale"
                value={formatCurrency(
                  calculation.allocated_recurring_cost,
                )}
              />

              <DetailRow
                label="Total channel cost"
                value={formatCurrency(
                  calculation.total_channel_cost,
                )}
                emphasised
              />
            </dl>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-amber-900">Profit margin</p>

              <p className="mt-2 text-2xl font-semibold text-amber-950">
                {formatNumber(calculation.profit_margin)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-amber-900">Estimated profit</p>

              <p className="mt-2 text-2xl font-semibold text-amber-950">
                {formatCurrency(calculation.estimated_profit)}
              </p>
            </div>

            <div>
              <p className="text-sm text-amber-900">
                Recommended selling price
              </p>

              <p className="mt-2 text-3xl font-semibold text-amber-950">
                {formatCurrency(calculation.recommended_price)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-amber-700 bg-white px-5 py-3 font-semibold text-amber-800 transition hover:bg-amber-50"
          >
            Back to dashboard
          </Link>

          <Link
            href="/calculations/new"
            className="inline-flex items-center justify-center rounded-xl bg-amber-700 px-5 py-3 font-semibold text-white transition hover:bg-amber-800"
          >
            Create another calculation
          </Link>
        </div>
      </div>
    </main>
  );
}