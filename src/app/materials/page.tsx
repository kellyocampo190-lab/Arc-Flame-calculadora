import Link from "next/link";

import { createClient } from "@/lib/supabase/server";


type Material = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  unit_cost: number | string;
  supplier: string | null;
  is_active: boolean;
};

export default async function MaterialsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select(
      "id, name, category, unit, unit_cost, supplier, is_active",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load materials: ${error.message}`);
  }

  const materials = (data ?? []) as Material[];

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-block text-sm font-medium text-amber-800 hover:text-amber-950"
            >
              ← Back to dashboard
            </Link>

            <h1 className="text-3xl font-semibold tracking-tight">
              Materials
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Manage the materials and components used to create jewellery.
            </p>
          </div>

          <Link
            href="/materials/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Add material
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {materials.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
                ✦
              </div>

              <h2 className="text-lg font-semibold">
                No materials have been added
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
                Add silver, stones, chains, clasps, packaging or any other
                material used when making jewellery.
              </p>

              <Link
                href="/materials/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-800"
              >
                Add the first material
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Material</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Unit</th>
                    <th className="px-6 py-4 font-semibold">Unit cost</th>
                    <th className="px-6 py-4 font-semibold">Supplier</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="transition hover:bg-stone-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {material.name}
                      </td>

                      <td className="px-6 py-4 text-stone-600">
                        {material.category || "Not specified"}
                      </td>

                      <td className="px-6 py-4 text-stone-600">
                        {material.unit}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          currency: "GBP",
                        }).format(Number(material.unit_cost))}
                      </td>

                      <td className="px-6 py-4 text-stone-600">
                        {material.supplier || "Not specified"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            material.is_active
                              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                              : "rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-600"
                          }
                        >
                          {material.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}