"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ExtraCostType =
  | "material"
  | "additional_labour"
  | "other";

export type QuotationExtraCostInput = {
  costType: ExtraCostType;
  description: string;
  quantity: number;
  unitCost: number;
};

export type CreateQuotationInput = {
  calculationId: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string;

  issueDate: string;
  expiryDate: string;

  jewelleryDescription: string;
  quantity: number;

  subtotal: number;
  deliveryCost: number;
  depositRequired: number;

  estimatedProductionTime: string;
  paymentTerms: string;
  notes: string;

  extraCosts: QuotationExtraCostInput[];
};

export type CreateQuotationResult = {
  success: boolean;
  quotationId?: string;
  quotationNumber?: string;
  message: string;
};

function safeNumber(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

function roundCurrency(value: number) {
  return Math.round(safeNumber(value) * 100) / 100;
}

function optionalText(value: string) {
  const cleanedValue = value.trim();

  return cleanedValue || null;
}

function createQuotationNumber() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const identifier = randomUUID()
    .replaceAll("-", "")
    .slice(0, 6)
    .toUpperCase();

  return `AF-${year}${month}${day}-${identifier}`;
}

export async function createQuotation(
  input: CreateQuotationInput,
): Promise<CreateQuotationResult> {
  const calculationId = input.calculationId.trim();
  const customerName = input.customerName.trim();
  const jewelleryDescription =
    input.jewelleryDescription.trim();

  if (!calculationId) {
    return {
      success: false,
      message: "Select a saved calculation.",
    };
  }

  if (!customerName) {
    return {
      success: false,
      message: "Enter the customer’s name.",
    };
  }

  if (!jewelleryDescription) {
    return {
      success: false,
      message: "Enter a description of the jewellery.",
    };
  }

  if (!input.issueDate) {
    return {
      success: false,
      message: "Select an issue date.",
    };
  }

  if (
    input.expiryDate &&
    input.expiryDate < input.issueDate
  ) {
    return {
      success: false,
      message:
        "The expiry date cannot be before the issue date.",
    };
  }

  const quantity = Math.max(
    1,
    Math.floor(safeNumber(input.quantity)),
  );

  const baseSubtotal = roundCurrency(input.subtotal);
  const deliveryCost = roundCurrency(input.deliveryCost);

  const extraCosts = input.extraCosts
    .map((cost) => {
      const quantity = safeNumber(cost.quantity);
      const unitCost = roundCurrency(cost.unitCost);

      return {
        costType: cost.costType,
        description: cost.description.trim(),
        quantity,
        unitCost,
        totalCost: roundCurrency(quantity * unitCost),
      };
    })
    .filter((cost) => cost.description.length > 0);

  const invalidExtraCost = extraCosts.some(
    (cost) => cost.quantity <= 0,
  );

  if (invalidExtraCost) {
    return {
      success: false,
      message:
        "Each one-off cost must have a quantity greater than zero.",
    };
  }

  const extraCostsTotal = roundCurrency(
    extraCosts.reduce(
      (total, cost) => total + cost.totalCost,
      0,
    ),
  );

  const quotationSubtotal = roundCurrency(
    baseSubtotal + extraCostsTotal,
  );

  const quotationTotal = roundCurrency(
    quotationSubtotal + deliveryCost,
  );

  const depositRequired = roundCurrency(
    input.depositRequired,
  );

  if (depositRequired > quotationTotal) {
    return {
      success: false,
      message:
        "The deposit cannot be greater than the quotation total.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message:
        "Your session has expired. Please sign in again.",
    };
  }

  const { data: calculation, error: calculationError } =
    await supabase
      .from("calculations")
      .select("id")
      .eq("id", calculationId)
      .eq("user_id", user.id)
      .single();

  if (calculationError || !calculation) {
    return {
      success: false,
      message:
        "The selected calculation could not be found.",
    };
  }

  const { data: customer, error: customerError } =
    await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        name: customerName,
        email: optionalText(input.customerEmail),
        phone: optionalText(input.customerPhone),
        address: optionalText(input.customerAddress),
        notes: optionalText(input.customerNotes),
      })
      .select("id")
      .single();

  if (customerError || !customer) {
    return {
      success: false,
      message:
        customerError?.message ??
        "The customer could not be saved.",
    };
  }

  const quotationNumber = createQuotationNumber();

  const { data: quotation, error: quotationError } =
    await supabase
      .from("quotations")
      .insert({
        user_id: user.id,
        quotation_number: quotationNumber,
        customer_id: customer.id,
        calculation_id: calculationId,
        status: "draft",

        issue_date: input.issueDate,
        expiry_date: input.expiryDate || null,

        jewellery_description: jewelleryDescription,
        quantity,
        currency: "GBP",

        subtotal: quotationSubtotal,
        delivery_cost: deliveryCost,
        total: quotationTotal,
        deposit_required: depositRequired,

        estimated_production_time: optionalText(
          input.estimatedProductionTime,
        ),
        payment_terms: optionalText(input.paymentTerms),
        notes: optionalText(input.notes),
      })
      .select("id")
      .single();

  if (quotationError || !quotation) {
    await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id)
      .eq("user_id", user.id);

    return {
      success: false,
      message:
        quotationError?.message ??
        "The quotation could not be created.",
    };
  }

  if (extraCosts.length > 0) {
    const extraCostRecords = extraCosts.map((cost) => ({
      quotation_id: quotation.id,
      user_id: user.id,
      cost_type: cost.costType,
      description: cost.description,
      quantity: cost.quantity,
      unit_cost: cost.unitCost,
      total_cost: cost.totalCost,
    }));

    const { error: extraCostsError } = await supabase
      .from("quotation_extra_costs")
      .insert(extraCostRecords);

    if (extraCostsError) {
      await supabase
        .from("quotations")
        .delete()
        .eq("id", quotation.id)
        .eq("user_id", user.id);

      await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id)
        .eq("user_id", user.id);

      return {
        success: false,
        message: `The one-off costs could not be saved: ${extraCostsError.message}`,
      };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/quotations");

  return {
    success: true,
    quotationId: quotation.id,
    quotationNumber,
    message: "Quotation created successfully.",
  };
}