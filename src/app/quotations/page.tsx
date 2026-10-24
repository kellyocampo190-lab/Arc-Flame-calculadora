import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

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
    return "No expiry date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
  if (status === "accepted") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-800";
  }

  if (status === "sent") {
    return "bg-blue-100 text-blue-800";
  }

  if (status === "expired") {
    return "bg-stone-200 text-stone-700";
  }

  return "bg-amber-100 text-amber-800";
}
export const instant = false;

export default async function QuotationsPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: quotations, error } = await supabase
    .from("quotations")
    .select(
      `
        id,
        quotation_number,
        customer_id,
        status,
        issue_date,
        expiry_date,
        jewellery_description,
        quantity,
        currency,
        total,
        deposit_required,
        created_at
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const customerIds = [
    ...new Set(
      (quotations ?? [])
        .map((quotation) => quotation.customer_id)
        .filter(
          (customerId): customerId is string =>
            Boolean(customerId),
        ),
    ),
  ];

  const customersResult =
    customerIds.length > 0
      ? await supabase
          .from("customers")
          .select("id, name")
          .eq("user_id", user.id)
          .in("id", customerIds)
      : { data: [], error: null };

  const customerNames = new Map(
    (customersResult.data ?? []).map((customer) => [
      customer.id,
      customer.name,
    ]),
  );

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
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
              Quotations
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
              Review customer quotations and open their complete
              information.
            </p>
          </div>

          <Link
            href="/quotations/new"
            className="w-fit rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            + Create quotation
          </Link>
        </header>

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            The quotations could not be loaded: {error.message}
          </div>
        )}

        {!error && (quotations ?? []).length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-stone-900">
              No quotations yet
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600">
              Create the first customer quotation using one of
              your saved calculations.
            </p>

            <Link
              href="/quotations/new"
              className="mt-6 inline-block rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Create first quotation
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(quotations ?? []).map((quotation) => {
              const customerName = quotation.customer_id
                ? customerNames.get(quotation.customer_id)
                : null;

              return (
                <Link
                  key={quotation.id}
                  href={`/quotations/${quotation.id}`}
                  className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        {quotation.quotation_number}
                      </p>

                      <p className="mt-2 text-sm text-stone-500">
                        {formatDate(quotation.issue_date)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        quotation.status,
                      )}`}
                    >
                      {formatStatus(quotation.status)}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-stone-900 group-hover:text-amber-800">
                    {quotation.jewellery_description}
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">
                        Customer
                      </span>

                      <span className="text-right font-medium text-stone-800">
                        {customerName || "Not available"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">
                        Quantity
                      </span>

                      <span className="font-medium text-stone-800">
                        {quotation.quantity}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-stone-500">
                        Expiry
                      </span>

                      <span className="text-right font-medium text-stone-800">
                        {formatDate(quotation.expiry_date)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-stone-200 pt-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-stone-900">
                        {formatCurrency(
                          quotation.total,
                          quotation.currency ?? "GBP",
                        )}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-amber-800">
                      View quotation →
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}