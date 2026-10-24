"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SalesChannel =
  | "direct"
  | "own_website"
  | "online_marketplace"
  | "physical_display"
  | "market_event"
  | "other";

export type CalculationMaterialInput = {
  materialId: string;
  materialName: string;
  unit: string;
  unitCost: number;
  quantity: number;
  totalCost: number;
};

export type SaveCalculationInput = {
  pieceName: string;

  materialCost: number;
  labourHours: number;
  hourlyRate: number;
  labourCost: number;

  packagingCost: number;
  deliveryCost: number;
  otherExpenses: number;
  productionCost: number;

  profitMargin: number;

  salesChannel: SalesChannel;
  channelName: string;

  percentageFeeRate: number;
  percentageFeeAmount: number;
  fixedFee: number;
  recurringCost: number;
  expectedSales: number;
  allocatedRecurringCost: number;
  totalChannelCost: number;

  estimatedProfit: number;
  recommendedPrice: number;

  materials: CalculationMaterialInput[];
};

export type SaveCalculationResult = {
  success: boolean;
  calculationId?: string;
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

export async function saveCalculation(
  input: SaveCalculationInput,
): Promise<SaveCalculationResult> {
  const pieceName = input.pieceName.trim();

  if (!pieceName) {
    return {
      success: false,
      message: "Enter a name for the jewellery piece.",
    };
  }

  if (input.materials.length === 0) {
    return {
      success: false,
      message: "Add at least one material before saving.",
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
      message: "Your session has expired. Please sign in again.",
    };
  }

  const { data: calculation, error: calculationError } =
    await supabase
      .from("calculations")
      .insert({
        user_id: user.id,
        piece_name: pieceName,

        material_cost: roundCurrency(input.materialCost),

        labour_hours: safeNumber(input.labourHours),
        hourly_rate: roundCurrency(input.hourlyRate),
        labour_cost: roundCurrency(input.labourCost),

        packaging_cost: roundCurrency(
          input.packagingCost,
        ),
        delivery_cost: roundCurrency(input.deliveryCost),
        other_expenses: roundCurrency(
          input.otherExpenses,
        ),
        production_cost: roundCurrency(
          input.productionCost,
        ),

        profit_margin: safeNumber(input.profitMargin),

        sales_channel: input.salesChannel,
        channel_name:
          input.channelName.trim() || null,

        percentage_fee_rate: safeNumber(
          input.percentageFeeRate,
        ),
        percentage_fee_amount: roundCurrency(
          input.percentageFeeAmount,
        ),

        fixed_fee: roundCurrency(input.fixedFee),
        recurring_cost: roundCurrency(
          input.recurringCost,
        ),
        expected_sales: Math.floor(
          safeNumber(input.expectedSales),
        ),
        allocated_recurring_cost: roundCurrency(
          input.allocatedRecurringCost,
        ),
        total_channel_cost: roundCurrency(
          input.totalChannelCost,
        ),

        estimated_profit: roundCurrency(
          input.estimatedProfit,
        ),
        recommended_price: roundCurrency(
          input.recommendedPrice,
        ),
      })
      .select("id")
      .single();

  if (calculationError || !calculation) {
    return {
      success: false,
      message:
        calculationError?.message ??
        "The calculation could not be saved.",
    };
  }

  const materialRecords = input.materials.map(
    (material) => ({
      calculation_id: calculation.id,
      material_id: material.materialId,
      material_name: material.materialName,
      unit: material.unit,
      unit_cost: roundCurrency(material.unitCost),
      quantity: safeNumber(material.quantity),
      total_cost: roundCurrency(material.totalCost),
    }),
  );

  const { error: materialsError } =
  await supabase.rpc(
    "save_calculation_materials",
    {
      p_calculation_id: calculation.id,
      p_materials: materialRecords,
    },
  );

  if (materialsError) {
    await supabase
      .from("calculations")
      .delete()
      .eq("id", calculation.id);

    return {
      success: false,
      message: `The materials could not be saved: ${materialsError.message}`,
    };
  }

  revalidatePath("/calculations");

  return {
    success: true,
    calculationId: calculation.id,
    message: "Calculation saved successfully.",
  };
}