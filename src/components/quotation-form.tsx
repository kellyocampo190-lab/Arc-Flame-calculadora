"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createQuotation,
  type ExtraCostType,
} from "@/app/quotations/actions";

type SavedCalculation = {
  id: string;
  pieceName: string;
  recommendedPrice: number;
  deliveryCost: number;
  createdAt: string;
};

type QuotationFormProps = {
  calculations: SavedCalculation[];
};

type ExtraCostRow = {
  id: string;
  costType: ExtraCostType;
  description: string;
  quantity: string;
  unitCost: string;
};

function getDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);

  return getDateString(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function safeNumber(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function createExtraCostRow(): ExtraCostRow {
  return {
    id: crypto.randomUUID(),
    costType: "material",
    description: "",
    quantity: "1",
    unitCost: "0",
  };
}

export default function QuotationForm({
  calculations,
}: QuotationFormProps) {
  const router = useRouter();

  const [calculationId, setCalculationId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [issueDate, setIssueDate] = useState(
    getDateString(new Date()),
  );
  const [expiryDate, setExpiryDate] = useState(
    getInitialExpiryDate(),
  );

  const [jewelleryDescription, setJewelleryDescription] =
    useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [deliveryCost, setDeliveryCost] = useState("0");
  const [depositRequired, setDepositRequired] = useState("0");

  const [extraCosts, setExtraCosts] = useState<
    ExtraCostRow[]
  >([]);

  const [
    estimatedProductionTime,
    setEstimatedProductionTime,
  ] = useState("");

  const [paymentTerms, setPaymentTerms] = useState(
    "Payment is required before the order is dispatched.",
  );

  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "success" | "error" | ""
  >("");

  const quantityNumber = Math.max(
    1,
    Math.floor(safeNumber(quantity)),
  );

  const unitPriceNumber = safeNumber(unitPrice);
  const deliveryCostNumber = safeNumber(deliveryCost);

  const baseSubtotal = unitPriceNumber * quantityNumber;

  const extraCostsTotal = extraCosts.reduce(
    (total, cost) =>
      total +
      safeNumber(cost.quantity) *
        safeNumber(cost.unitCost),
    0,
  );

  const subtotal = baseSubtotal + extraCostsTotal;
  const total = subtotal + deliveryCostNumber;

  const selectedCalculation = useMemo(
    () =>
      calculations.find(
        (calculation) => calculation.id === calculationId,
      ),
    [calculationId, calculations],
  );

  function handleCalculationChange(id: string) {
    setCalculationId(id);

    const calculation = calculations.find(
      (item) => item.id === id,
    );

    if (!calculation) {
      return;
    }

    setJewelleryDescription(calculation.pieceName);
    setUnitPrice(String(calculation.recommendedPrice));
    setDeliveryCost(String(calculation.deliveryCost));
  }

  function addExtraCost() {
    setExtraCosts((currentCosts) => [
      ...currentCosts,
      createExtraCostRow(),
    ]);
  }

  function removeExtraCost(id: string) {
    setExtraCosts((currentCosts) =>
      currentCosts.filter((cost) => cost.id !== id),
    );
  }

  function updateExtraCost(
    id: string,
    field:
      | "costType"
      | "description"
      | "quantity"
      | "unitCost",
    value: string,
  ) {
    setExtraCosts((currentCosts) =>
      currentCosts.map((cost) =>
        cost.id === id
          ? {
              ...cost,
              [field]: value,
            }
          : cost,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const preparedExtraCosts = extraCosts
      .filter(
        (cost) => cost.description.trim().length > 0,
      )
      .map((cost) => ({
        costType: cost.costType,
        description: cost.description,
        quantity: safeNumber(cost.quantity),
        unitCost: safeNumber(cost.unitCost),
      }));

    const hasInvalidExtraCost = preparedExtraCosts.some(
      (cost) => cost.quantity <= 0,
    );

    if (hasInvalidExtraCost) {
      setStatus("error");
      setMessage(
        "Each one-off cost must have a quantity greater than zero.",
      );
      return;
    }

    setIsSaving(true);
    setMessage("");
    setStatus("");

    const result = await createQuotation({
      calculationId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerNotes,
      issueDate,
      expiryDate,
      jewelleryDescription,
      quantity: quantityNumber,

      // Only the saved calculation subtotal is sent here.
      // The server adds the one-off costs separately.
      subtotal: baseSubtotal,

      deliveryCost: deliveryCostNumber,
      depositRequired: safeNumber(depositRequired),
      estimatedProductionTime,
      paymentTerms,
      notes,
      extraCosts: preparedExtraCosts,
    });

    setIsSaving(false);
    setMessage(result.message);

    if (!result.success || !result.quotationId) {
      setStatus("error");
      return;
    }

    setStatus("success");

    router.push(`/quotations/${result.quotationId}`);
    router.refresh();
  }

  if (calculations.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-950">
          No calculations available
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-900">
          Create and save a cost calculation before preparing a
          quotation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="space-y-8">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Saved calculation
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Select the cost calculation that will be used as the
            starting point for this quotation.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-stone-700">
              Calculation
            </span>

            <select
              required
              value={calculationId}
              onChange={(event) =>
                handleCalculationChange(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
            >
              <option value="">Select a calculation</option>

              {calculations.map((calculation) => (
                <option
                  key={calculation.id}
                  value={calculation.id}
                >
                  {calculation.pieceName} —{" "}
                  {formatCurrency(
                    calculation.recommendedPrice,
                  )}
                </option>
              ))}
            </select>
          </label>

          {selectedCalculation && (
            <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-700">
              Selected price:{" "}
              <strong>
                {formatCurrency(
                  selectedCalculation.recommendedPrice,
                )}
              </strong>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Customer details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-700">
                Customer name
              </span>

              <input
                required
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                placeholder="Customer’s full name"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Email
              </span>

              <input
                type="email"
                value={customerEmail}
                onChange={(event) =>
                  setCustomerEmail(event.target.value)
                }
                placeholder="customer@example.com"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Phone number
              </span>

              <input
                type="tel"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(event.target.value)
                }
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-700">
                Address
              </span>

              <textarea
                value={customerAddress}
                onChange={(event) =>
                  setCustomerAddress(event.target.value)
                }
                rows={3}
                placeholder="Optional delivery or billing address"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-700">
                Customer notes
              </span>

              <textarea
                value={customerNotes}
                onChange={(event) =>
                  setCustomerNotes(event.target.value)
                }
                rows={3}
                placeholder="Optional internal information about the customer"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Quotation details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-stone-700">
                Issue date
              </span>

              <input
                required
                type="date"
                value={issueDate}
                onChange={(event) =>
                  setIssueDate(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Expiry date
              </span>

              <input
                type="date"
                min={issueDate}
                value={expiryDate}
                onChange={(event) =>
                  setExpiryDate(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-700">
                Jewellery description
              </span>

              <textarea
                required
                value={jewelleryDescription}
                onChange={(event) =>
                  setJewelleryDescription(event.target.value)
                }
                rows={4}
                placeholder="Describe the jewellery and personalised details"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Quantity
              </span>

              <input
                required
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Unit price (£)
              </span>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(event) =>
                  setUnitPrice(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Delivery cost (£)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={deliveryCost}
                onChange={(event) =>
                  setDeliveryCost(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Deposit required (£)
              </span>

              <input
                type="number"
                min="0"
                max={total}
                step="0.01"
                value={depositRequired}
                onChange={(event) =>
                  setDepositRequired(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-amber-950">
                One-off custom costs
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
                Add special materials, additional labour or other
                costs required only for this custom order. These
                items will not be saved in the materials catalogue.
              </p>
            </div>

            <button
              type="button"
              onClick={addExtraCost}
              className="shrink-0 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              + Add cost
            </button>
          </div>

          {extraCosts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-white/60 p-6 text-center">
              <p className="text-sm font-medium text-amber-900">
                No one-off costs have been added.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                You can create the quotation using only the saved
                calculation.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {extraCosts.map((cost, index) => {
                const rowTotal =
                  safeNumber(cost.quantity) *
                  safeNumber(cost.unitCost);

                return (
                  <div
                    key={cost.id}
                    className="rounded-xl border border-amber-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-stone-900">
                        Custom cost {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeExtraCost(cost.id)
                        }
                        className="text-sm font-semibold text-red-700 transition hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="text-sm font-semibold text-stone-700">
                          Cost type
                        </span>

                        <select
                          value={cost.costType}
                          onChange={(event) =>
                            updateExtraCost(
                              cost.id,
                              "costType",
                              event.target.value,
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                        >
                          <option value="material">
                            Special material
                          </option>

                          <option value="additional_labour">
                            Additional labour
                          </option>

                          <option value="other">
                            Other expense
                          </option>
                        </select>
                      </label>

                      <label>
                        <span className="text-sm font-semibold text-stone-700">
                          Description
                        </span>

                        <input
                          type="text"
                          value={cost.description}
                          onChange={(event) =>
                            updateExtraCost(
                              cost.id,
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="For example: Rose quartz"
                          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                        />
                      </label>

                      <label>
                        <span className="text-sm font-semibold text-stone-700">
                          Quantity
                        </span>

                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={cost.quantity}
                          onChange={(event) =>
                            updateExtraCost(
                              cost.id,
                              "quantity",
                              event.target.value,
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                        />
                      </label>

                      <label>
                        <span className="text-sm font-semibold text-stone-700">
                          Cost to add (£)
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cost.unitCost}
                          onChange={(event) =>
                            updateExtraCost(
                              cost.id,
                              "unitCost",
                              event.target.value,
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex justify-end border-t border-stone-200 pt-4">
                      <p className="text-sm text-stone-600">
                        Cost total:{" "}
                        <strong className="text-stone-900">
                          {formatCurrency(rowTotal)}
                        </strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Conditions and notes
          </h2>

          <div className="mt-6 grid gap-5">
            <label>
              <span className="text-sm font-semibold text-stone-700">
                Estimated production time
              </span>

              <input
                type="text"
                value={estimatedProductionTime}
                onChange={(event) =>
                  setEstimatedProductionTime(
                    event.target.value,
                  )
                }
                placeholder="For example: 2–3 weeks"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Payment terms
              </span>

              <textarea
                value={paymentTerms}
                onChange={(event) =>
                  setPaymentTerms(event.target.value)
                }
                rows={3}
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-stone-700">
                Additional notes
              </span>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={4}
                placeholder="Add any conditions or information the customer should know"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-6 lg:sticky lg:top-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
          Quotation summary
        </p>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-stone-600">
              Saved calculation
            </span>

            <span className="font-semibold text-stone-900">
              {formatCurrency(baseSubtotal)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-stone-600">
              One-off custom costs
            </span>

            <span className="font-semibold text-stone-900">
              {formatCurrency(extraCostsTotal)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-stone-600">
              Subtotal
            </span>

            <span className="font-semibold text-stone-900">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-stone-600">
              Delivery
            </span>

            <span className="font-semibold text-stone-900">
              {formatCurrency(deliveryCostNumber)}
            </span>
          </div>

          <div className="border-t border-amber-200 pt-4">
            <div className="flex items-end justify-between gap-4">
              <span className="font-semibold text-amber-950">
                Total
              </span>

              <span className="text-3xl font-semibold text-amber-900">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-7 w-full rounded-xl bg-amber-700 px-5 py-3.5 font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? "Creating quotation..."
            : "Create quotation"}
        </button>

        {message && (
          <div
            className={
              status === "success"
                ? "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
                : "mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
            }
          >
            {message}
          </div>
        )}
      </aside>
    </form>
  );
}