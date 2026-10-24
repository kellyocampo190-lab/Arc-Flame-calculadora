import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import QuotationPdfDownload from "@/components/quotation-pdf-download";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type QuotationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(
  value: number | string | null,
  currency = "GBP",
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(Number(value ?? 0));
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCostType(value: string) {
  if (value === "material") {
    return "Special material";
  }

  if (value === "additional_labour") {
    return "Additional labour";
  }

  return "Other expense";
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function QuotationDetailPage({
  params,
}: QuotationDetailPageProps) {
  await connection();

  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: quotation, error: quotationError } =
    await supabase
      .from("quotations")
      .select(
        `
          id,
          quotation_number,
          customer_id,
          calculation_id,
          status,
          issue_date,
          expiry_date,
          jewellery_description,
          quantity,
          currency,
          subtotal,
          delivery_cost,
          total,
          deposit_required,
          estimated_production_time,
          payment_terms,
          notes,
          created_at
        `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

  if (quotationError || !quotation) {
    notFound();
  }

  const customerResult = quotation.customer_id
    ? await supabase
        .from("customers")
        .select(
          `
            id,
            name,
            email,
            phone,
            address,
            notes
          `,
        )
        .eq("id", quotation.customer_id)
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const { data: extraCosts } = await supabase
    .from("quotation_extra_costs")
    .select(
      `
        id,
        cost_type,
        description,
        quantity,
        unit_cost,
        total_cost
      `,
    )
    .eq("quotation_id", quotation.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const customer = customerResult.data;
  const currency = quotation.currency ?? "GBP";

  const oneOffCostsTotal = (extraCosts ?? []).reduce(
    (total, cost) =>
      total + Number(cost.total_cost ?? 0),
    0,
  );

  const baseCalculationAmount =
    Number(quotation.subtotal ?? 0) -
    oneOffCostsTotal;

  const outstandingBalance = Math.max(
    0,
    Number(quotation.total ?? 0) -
      Number(quotation.deposit_required ?? 0),
  );
const pdfData = {
  quotationNumber: quotation.quotation_number,
  status: quotation.status,
  issueDate: quotation.issue_date,
  expiryDate: quotation.expiry_date,

  jewelleryDescription:
    quotation.jewellery_description,
  quantity: Number(quotation.quantity),
  currency,

  baseCalculationAmount,
  oneOffCostsTotal,
  subtotal: Number(quotation.subtotal ?? 0),
  deliveryCost: Number(
    quotation.delivery_cost ?? 0,
  ),
  total: Number(quotation.total ?? 0),
  depositRequired: Number(
    quotation.deposit_required ?? 0,
  ),

  estimatedProductionTime:
    quotation.estimated_production_time,
  paymentTerms: quotation.payment_terms,
  notes: quotation.notes,

  customer: customer
    ? {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      }
    : null,

  extraCosts: (extraCosts ?? []).map((cost) => ({
    id: cost.id,
    costType: cost.cost_type,
    description: cost.description,
    quantity: Number(cost.quantity),
    unitCost: Number(cost.unit_cost),
    totalCost: Number(cost.total_cost),
  })),
};
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
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
              Quotation
            </h1>

            <p className="mt-3 text-lg font-semibold text-stone-700">
              {quotation.quotation_number}
            </p>
          </div>

          <span className="w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
            {formatStatus(quotation.status)}
          </span>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-500">
              Issue date
            </p>

            <p className="mt-2 font-semibold text-stone-900">
              {formatDate(quotation.issue_date)}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-500">
              Expiry date
            </p>

            <p className="mt-2 font-semibold text-stone-900">
              {formatDate(quotation.expiry_date)}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-medium text-amber-800">
              Quotation total
            </p>

            <p className="mt-2 text-3xl font-semibold text-amber-950">
              {formatCurrency(
                quotation.total,
                currency,
              )}
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold">
                Jewellery details
              </h2>

              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm font-medium text-stone-500">
                    Description
                  </dt>

                  <dd className="mt-2 whitespace-pre-wrap leading-7 text-stone-800">
                    {quotation.jewellery_description}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-stone-500">
                    Quantity
                  </dt>

                  <dd className="mt-2 font-semibold">
                    {quotation.quantity}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-stone-500">
                    Estimated production time
                  </dt>

                  <dd className="mt-2 text-stone-800">
                    {quotation.estimated_production_time ||
                      "Not specified"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold">
                Customer details
              </h2>

              {customer ? (
                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-stone-500">
                      Name
                    </dt>

                    <dd className="mt-2 font-semibold">
                      {customer.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-stone-500">
                      Email
                    </dt>

                    <dd className="mt-2 break-words text-stone-800">
                      {customer.email || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-stone-500">
                      Phone
                    </dt>

                    <dd className="mt-2 text-stone-800">
                      {customer.phone || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-stone-500">
                      Address
                    </dt>

                    <dd className="mt-2 whitespace-pre-wrap text-stone-800">
                      {customer.address || "Not provided"}
                    </dd>
                  </div>

                  {customer.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-stone-500">
                        Internal customer notes
                      </dt>

                      <dd className="mt-2 whitespace-pre-wrap text-stone-800">
                        {customer.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="mt-4 text-stone-600">
                  No customer information is available.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  One-off custom costs
                </h2>

                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {(extraCosts ?? []).length} items
                </span>
              </div>

              {(extraCosts ?? []).length === 0 ? (
                <p className="mt-5 text-stone-600">
                  No one-off costs were added to this quotation.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {(extraCosts ?? []).map((cost) => (
                    <div
                      key={cost.id}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-stone-900">
                            {cost.description}
                          </p>

                          <p className="mt-1 text-sm text-stone-500">
                            {formatCostType(cost.cost_type)}
                          </p>
                        </div>

                        <p className="font-semibold text-amber-800">
                          {formatCurrency(
                            cost.total_cost,
                            currency,
                          )}
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-stone-600">
                        {Number(cost.quantity)} ×{" "}
                        {formatCurrency(
                          cost.unit_cost,
                          currency,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {(quotation.payment_terms ||
              quotation.notes) && (
              <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold">
                  Conditions and notes
                </h2>

                {quotation.payment_terms && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-stone-500">
                      Payment terms
                    </p>

                    <p className="mt-2 whitespace-pre-wrap leading-7 text-stone-800">
                      {quotation.payment_terms}
                    </p>
                  </div>
                )}

                {quotation.notes && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-stone-500">
                      Additional notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap leading-7 text-stone-800">
                      {quotation.notes}
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-6 lg:sticky lg:top-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Price summary
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-stone-600">
                  Saved calculation
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    baseCalculationAmount,
                    currency,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-stone-600">
                  One-off custom costs
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    oneOffCostsTotal,
                    currency,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-stone-600">
                  Subtotal
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    quotation.subtotal,
                    currency,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-stone-600">
                  Delivery
                </span>

                <span className="font-semibold">
                  {formatCurrency(
                    quotation.delivery_cost,
                    currency,
                  )}
                </span>
              </div>

              <div className="border-t border-amber-200 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-semibold text-amber-950">
                    Total
                  </span>

                  <span className="text-3xl font-semibold text-amber-950">
                    {formatCurrency(
                      quotation.total,
                      currency,
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-amber-200 pt-4">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-600">
                    Deposit required
                  </span>

                  <span className="font-semibold">
                    {formatCurrency(
                      quotation.deposit_required,
                      currency,
                    )}
                  </span>
                </div>

                <div className="mt-4 flex justify-between gap-4">
                  <span className="text-stone-600">
                    Remaining balance
                  </span>

                  <span className="font-semibold">
                    {formatCurrency(
                      outstandingBalance,
                      currency,
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-7">
             <QuotationPdfDownload data={pdfData} />
             </div>

            <Link
              href="/dashboard"
              className="mt-3 block w-full rounded-xl border border-amber-700 bg-white px-5 py-3 text-center text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Return to dashboard
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}