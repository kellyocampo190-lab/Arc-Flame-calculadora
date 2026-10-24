import Link from "next/link";

import { createMaterial } from "../actions";

export default function NewMaterialPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/materials"
          className="mb-5 inline-block text-sm font-medium text-amber-800 hover:text-amber-950"
        >
          ← Back to materials
        </Link>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-6 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Arc & Flame
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Add material
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Register a material or component used when making jewellery.
            </p>
          </div>

          <form action={createMaterial} className="space-y-6 px-6 py-8 sm:px-8">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Material name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="For example, sterling silver wire"
                className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Select a category</option>
                  <option value="Metal">Metal</option>
                  <option value="Stone or sea glass">
                    Stone or sea glass
                  </option>
                  <option value="Chain">Chain</option>
                  <option value="Clasp or finding">
                    Clasp or finding
                  </option>
                  <option value="Consumable">Consumable</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="mb-2 block text-sm font-medium"
                >
                  Unit of measurement
                </label>

                <select
                  id="unit"
                  name="unit"
                  required
                  defaultValue=""
                  className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="" disabled>
                    Select a unit
                  </option>
                  <option value="gram">Gram</option>
                  <option value="piece">Piece</option>
                  <option value="pair">Pair</option>
                  <option value="metre">Metre</option>
                  <option value="sheet">Sheet</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="unit_cost"
                  className="mb-2 block text-sm font-medium"
                >
                  Unit cost (£)
                </label>

                <input
                  id="unit_cost"
                  name="unit_cost"
                  type="number"
                  required
                  min="0"
                  step="0.0001"
                  placeholder="0.00"
                  className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div>
                <label
                  htmlFor="supplier"
                  className="mb-2 block text-sm font-medium"
                >
                  Supplier
                </label>

                <input
                  id="supplier"
                  name="supplier"
                  type="text"
                  placeholder="Optional"
                  className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Optional details about this material"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/materials"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium transition hover:bg-stone-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Save material
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}