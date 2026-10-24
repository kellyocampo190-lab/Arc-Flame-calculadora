"use client";

import {
  type FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";

import { saveCalculation } from "@/app/calculations/actions";

type Material = {
  id: string;
  name: string;
  unit: string;
  unit_cost: number | string;
};

type MaterialRow = {
  id: string;
  materialId: string;
  quantity: string;
};

type SalesChannel =
  | "direct"
  | "own_website"
  | "online_marketplace"
  | "physical_display"
  | "market_event"
  | "other";

type CostCalculatorFormProps = {
  materials: Material[];
};

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const salesChannelNames: Record<SalesChannel, string> = {
  direct: "Direct sale",
  own_website: "Own website",
  online_marketplace: "Online marketplace",
  physical_display: "Physical shop or display",
  market_event: "Craft market or event",
  other: "Other",
};

function formatCurrency(value: number) {
  return currencyFormatter.format(
    Number.isFinite(value) ? value : 0,
  );
}

function positiveNumber(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

export function CostCalculatorForm({
  materials,
}: CostCalculatorFormProps) {
  const [pieceName, setPieceName] = useState("");

  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([
    {
      id: "material-row-1",
      materialId: "",
      quantity: "",
    },
  ]);

  const [labourHours, setLabourHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [deliveryCost, setDeliveryCost] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [profitMargin, setProfitMargin] = useState("30");

  const [salesChannel, setSalesChannel] =
    useState<SalesChannel>("direct");

  const [customChannelName, setCustomChannelName] =
    useState("");

  const [percentageFee, setPercentageFee] = useState("");
  const [fixedFee, setFixedFee] = useState("");
  const [recurringCost, setRecurringCost] = useState("");
  const [expectedSales, setExpectedSales] = useState("");
  const [isSaving, startSaving] = useTransition();

const [saveMessage, setSaveMessage] = useState("");
const [saveStatus, setSaveStatus] = useState<
  "idle" | "success" | "error"
>("idle");

  const calculations = useMemo(() => {
    const materialCost = materialRows.reduce((total, row) => {
      const material = materials.find(
        (item) => item.id === row.materialId,
      );

      if (!material) {
        return total;
      }

      const unitCost = Number(material.unit_cost) || 0;
      const quantity = positiveNumber(row.quantity);

      return total + unitCost * quantity;
    }, 0);

    const labourCost =
      positiveNumber(labourHours) *
      positiveNumber(hourlyRate);

    const packaging = positiveNumber(packagingCost);
    const delivery = positiveNumber(deliveryCost);
    const other = positiveNumber(otherExpenses);

    const productionCost =
      materialCost +
      labourCost +
      packaging +
      delivery +
      other;

    const targetProfit =
      productionCost *
      (positiveNumber(profitMargin) / 100);

    const hasChannelFees = salesChannel !== "direct";

    const fixedCharge = hasChannelFees
      ? positiveNumber(fixedFee)
      : 0;

    const totalRecurringCost = hasChannelFees
      ? positiveNumber(recurringCost)
      : 0;

    const salesEstimate = hasChannelFees
      ? positiveNumber(expectedSales)
      : 0;

    const allocatedRecurringCost =
      totalRecurringCost > 0 && salesEstimate > 0
        ? totalRecurringCost / salesEstimate
        : 0;

    const percentageRate = hasChannelFees
      ? Math.min(positiveNumber(percentageFee) / 100, 0.99)
      : 0;

    const requiredAmount =
      productionCost +
      targetProfit +
      fixedCharge +
      allocatedRecurringCost;

    /*
      Dividing by 1 minus the percentage makes sure the
      percentage fee is recovered without reducing the
      intended profit.

      Example:
      Required amount = £100
      Fee = 10%
      Recommended price = £100 / 0.90 = £111.11
    */
    const recommendedPrice =
      percentageRate > 0
        ? requiredAmount / (1 - percentageRate)
        : requiredAmount;

    const percentageFeeAmount =
      recommendedPrice * percentageRate;

    const totalChannelCost =
      fixedCharge +
      allocatedRecurringCost +
      percentageFeeAmount;

    const estimatedProfit =
      recommendedPrice -
      productionCost -
      totalChannelCost;

    return {
      materialCost,
      labourCost,
      packaging,
      delivery,
      other,
      productionCost,
      targetProfit,
      fixedCharge,
      allocatedRecurringCost,
      percentageFeeAmount,
      totalChannelCost,
      estimatedProfit,
      recommendedPrice,
    };
  }, [
    materials,
    materialRows,
    labourHours,
    hourlyRate,
    packagingCost,
    deliveryCost,
    otherExpenses,
    profitMargin,
    salesChannel,
    percentageFee,
    fixedFee,
    recurringCost,
    expectedSales,
  ]);

  function updateMaterialRow(
    id: string,
    field: "materialId" | "quantity",
    value: string,
  ) {
    setMaterialRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function addMaterialRow() {
    setMaterialRows((currentRows) => [
      ...currentRows,
      {
        id: crypto.randomUUID(),
        materialId: "",
        quantity: "",
      },
    ]);
  }

  function removeMaterialRow(id: string) {
    setMaterialRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows;
      }

      return currentRows.filter((row) => row.id !== id);
    });
  }

  const channelDisplayName =
    salesChannel === "other" && customChannelName.trim()
      ? customChannelName.trim()
      : salesChannelNames[salesChannel];

  const recurringCostLabel =
    salesChannel === "market_event"
      ? "Total event cost (£)"
      : "Monthly channel cost (£)";

  const expectedSalesLabel =
    salesChannel === "market_event"
      ? "Expected pieces sold at the event"
      : "Expected monthly sales";
function handleSave(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setSaveMessage("");
  setSaveStatus("idle");

  const selectedMaterials = materialRows.flatMap(
    (row) => {
      const material = materials.find(
        (item) => item.id === row.materialId,
      );

      const quantity = positiveNumber(row.quantity);

      if (!material || quantity <= 0) {
        return [];
      }

      const unitCost =
        Number(material.unit_cost) || 0;

      return [
        {
          materialId: material.id,
          materialName: material.name,
          unit: material.unit,
          unitCost,
          quantity,
          totalCost: unitCost * quantity,
        },
      ];
    },
  );

  startSaving(async () => {
    const result = await saveCalculation({
      pieceName,

      materialCost: calculations.materialCost,

      labourHours: positiveNumber(labourHours),
      hourlyRate: positiveNumber(hourlyRate),
      labourCost: calculations.labourCost,

      packagingCost: calculations.packaging,
      deliveryCost: calculations.delivery,
      otherExpenses: calculations.other,
      productionCost: calculations.productionCost,

      profitMargin: positiveNumber(profitMargin),

      salesChannel,
      channelName: channelDisplayName,

      percentageFeeRate:
        salesChannel === "direct"
          ? 0
          : positiveNumber(percentageFee),

      percentageFeeAmount:
        calculations.percentageFeeAmount,

      fixedFee:
        salesChannel === "direct"
          ? 0
          : positiveNumber(fixedFee),

      recurringCost:
        salesChannel === "direct"
          ? 0
          : positiveNumber(recurringCost),

      expectedSales:
        salesChannel === "direct"
          ? 0
          : positiveNumber(expectedSales),

      allocatedRecurringCost:
        calculations.allocatedRecurringCost,

      totalChannelCost:
        calculations.totalChannelCost,

      estimatedProfit:
        calculations.estimatedProfit,

      recommendedPrice:
        calculations.recommendedPrice,

      materials: selectedMaterials,
    });

    setSaveMessage(result.message);
    setSaveStatus(
      result.success ? "success" : "error",
    );
  });
}
  return (
   <form
  onSubmit={handleSave}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="space-y-8">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Piece information
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Jewellery piece
          </h2>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-stone-700">
              Piece name
            </span>

            <input
              type="text"
              value={pieceName}
              onChange={(event) =>
                setPieceName(event.target.value)
              }
              placeholder="For example: silver sea glass ring"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Materials
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Materials used
              </h2>

              <p className="mt-2 text-sm text-stone-600">
                Select each material and enter the quantity used.
              </p>
            </div>

            <button
              type="button"
              onClick={addMaterialRow}
              className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
            >
              + Add material
            </button>
          </div>

          {materials.length === 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              There are no active materials available. Add or
              activate a material from the Materials section.
            </div>
          )}

          <div className="mt-6 space-y-4">
            {materialRows.map((row, index) => {
              const selectedMaterial = materials.find(
                (material) =>
                  material.id === row.materialId,
              );

              const rowCost = selectedMaterial
                ? (Number(selectedMaterial.unit_cost) || 0) *
                  positiveNumber(row.quantity)
                : 0;

              return (
                <div
                  key={row.id}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end">
                    <label>
                      <span className="text-sm font-medium text-stone-700">
                        Material {index + 1}
                      </span>

                      <select
                        value={row.materialId}
                        onChange={(event) =>
                          updateMaterialRow(
                            row.id,
                            "materialId",
                            event.target.value,
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                      >
                        <option value="">
                          Select a material
                        </option>

                        {materials.map((material) => (
                          <option
                            key={material.id}
                            value={material.id}
                          >
                            {material.name} —{" "}
                            {formatCurrency(
                              Number(material.unit_cost),
                            )}{" "}
                            per {material.unit}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="text-sm font-medium text-stone-700">
                        Quantity
                        {selectedMaterial
                          ? ` (${selectedMaterial.unit})`
                          : ""}
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.quantity}
                        onChange={(event) =>
                          updateMaterialRow(
                            row.id,
                            "quantity",
                            event.target.value,
                          )
                        }
                        placeholder="0"
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        removeMaterialRow(row.id)
                      }
                      disabled={materialRows.length === 1}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-sm">
                    <span className="text-stone-600">
                      Material cost
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(rowCost)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Labour
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Production time
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <CostInput
              label="Hours worked"
              value={labourHours}
              onChange={setLabourHours}
              step="0.25"
            />

            <CostInput
              label="Hourly rate (£)"
              value={hourlyRate}
              onChange={setHourlyRate}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Additional costs
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Expenses and profit
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <CostInput
              label="Packaging cost (£)"
              value={packagingCost}
              onChange={setPackagingCost}
            />

            <CostInput
              label="Delivery cost (£)"
              value={deliveryCost}
              onChange={setDeliveryCost}
            />

            <CostInput
              label="Other expenses (£)"
              value={otherExpenses}
              onChange={setOtherExpenses}
            />

            <CostInput
              label="Profit margin (%)"
              value={profitMargin}
              onChange={setProfitMargin}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Sales channel
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Where will this piece be sold?
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Select the sales location and enter only the fees
            that apply.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-stone-700">
              Sales channel
            </span>

            <select
              value={salesChannel}
              onChange={(event) =>
                setSalesChannel(
                  event.target.value as SalesChannel,
                )
              }
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
            >
              <option value="direct">Direct sale</option>
              <option value="own_website">Own website</option>
              <option value="online_marketplace">
                Online marketplace
              </option>
              <option value="physical_display">
                Physical shop or display
              </option>
              <option value="market_event">
                Craft market or event
              </option>
              <option value="other">Other</option>
            </select>
          </label>

          {salesChannel === "direct" ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-medium text-emerald-900">
                No channel fees
              </p>

              <p className="mt-1 text-sm text-emerald-800">
                A direct sale does not add commission,
                transaction or recurring location costs.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {salesChannel === "other" && (
                <label className="block">
                  <span className="text-sm font-medium text-stone-700">
                    Channel name
                  </span>

                  <input
                    type="text"
                    value={customChannelName}
                    onChange={(event) =>
                      setCustomChannelName(
                        event.target.value,
                      )
                    }
                    placeholder="Enter the sales channel name"
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <CostInput
                  label="Percentage fee or commission (%)"
                  value={percentageFee}
                  onChange={setPercentageFee}
                />

                <CostInput
                  label="Fixed fee per sale (£)"
                  value={fixedFee}
                  onChange={setFixedFee}
                />

                <CostInput
                  label={recurringCostLabel}
                  value={recurringCost}
                  onChange={setRecurringCost}
                />

                <CostInput
                  label={expectedSalesLabel}
                  value={expectedSales}
                  onChange={setExpectedSales}
                  step="1"
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                {positiveNumber(recurringCost) > 0 &&
                positiveNumber(expectedSales) === 0 ? (
                  <p>
                    Enter the expected number of sales to
                    distribute the recurring cost between the
                    jewellery pieces.
                  </p>
                ) : (
                  <p>
                    Allocated channel cost per piece:{" "}
                    <strong>
                      {formatCurrency(
                        calculations.allocatedRecurringCost,
                      )}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm lg:sticky lg:top-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
          Cost summary
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-amber-950">
          {pieceName.trim() || "New jewellery piece"}
        </h2>

        <p className="mt-2 text-sm text-amber-800">
          Sales channel: {channelDisplayName}
        </p>

        <div className="mt-6 space-y-4">
          <SummaryRow
            label="Materials"
            value={calculations.materialCost}
          />

          <SummaryRow
            label="Labour"
            value={calculations.labourCost}
          />

          <SummaryRow
            label="Packaging"
            value={calculations.packaging}
          />

          <SummaryRow
            label="Delivery"
            value={calculations.delivery}
          />

          <SummaryRow
            label="Other expenses"
            value={calculations.other}
          />

          <div className="border-t border-amber-200 pt-4">
            <SummaryRow
              label="Production cost"
              value={calculations.productionCost}
              emphasised
            />
          </div>

          <SummaryRow
            label="Allocated channel cost"
            value={calculations.allocatedRecurringCost}
          />

          <SummaryRow
            label="Fixed sale fee"
            value={calculations.fixedCharge}
          />

          <SummaryRow
            label="Percentage fee"
            value={calculations.percentageFeeAmount}
          />

          <SummaryRow
            label="Total channel fees"
            value={calculations.totalChannelCost}
          />

          <div className="border-t border-amber-200 pt-4">
            <SummaryRow
              label="Estimated profit"
              value={calculations.estimatedProfit}
              emphasised
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-amber-900 p-5 text-white">
          <p className="text-sm text-amber-100">
            Recommended selling price
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {formatCurrency(
              calculations.recommendedPrice,
            )}
          </p>
        </div>
            <button
            type="submit"
            disabled={isSaving}
            className="mt-5 w-full rounded-xl bg-amber-700 px-5 py-3.5 font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
            {isSaving
                ? "Saving calculation..."
                : "Save calculation"}
            </button>

            {saveMessage && (
            <div
                className={
                saveStatus === "success"
                    ? "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
                    : "mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
                }
            >
                {saveMessage}
            </div>
            )}
        <p className="mt-4 text-xs leading-5 text-amber-800">
          This price covers production costs, sales channel
          charges and the selected profit margin.
        </p>
      </aside>
    </form>
  );
}

type CostInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
};

function CostInput({
  label,
  value,
  onChange,
  step = "0.01",
}: CostInputProps) {
  return (
    <label>
      <span className="text-sm font-medium text-stone-700">
        {label}
      </span>

      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="0"
        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );
}

type SummaryRowProps = {
  label: string;
  value: number;
  emphasised?: boolean;
};

function SummaryRow({
  label,
  value,
  emphasised = false,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          emphasised
            ? "font-semibold text-amber-950"
            : "text-sm text-amber-900"
        }
      >
        {label}
      </span>

      <span
        className={
          emphasised
            ? "font-semibold text-amber-950"
            : "text-sm font-semibold text-amber-950"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}