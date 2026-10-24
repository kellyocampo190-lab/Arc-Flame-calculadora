"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function readMaterialForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const supplier = String(formData.get("supplier") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const unitCost = Number(formData.get("unit_cost"));

  if (!name) {
    throw new Error("Material name is required.");
  }

  if (!unit) {
    throw new Error("Unit of measurement is required.");
  }

  if (!Number.isFinite(unitCost) || unitCost < 0) {
    throw new Error("Unit cost must be a valid positive number.");
  }

  return {
    name,
    category: category || null,
    unit,
    unit_cost: unitCost,
    supplier: supplier || null,
    notes: notes || null,
  };
}

export async function createMaterial(formData: FormData) {
  const material = readMaterialForm(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("materials").insert({
    ...material,
    is_active: true,
  });

  if (error) {
    throw new Error(`Unable to create material: ${error.message}`);
  }

  revalidatePath("/materials");
  redirect("/materials");
}

export async function updateMaterial(
  materialId: string,
  formData: FormData,
) {
  const material = readMaterialForm(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .update(material)
    .eq("id", materialId);

  if (error) {
    throw new Error(`Unable to update material: ${error.message}`);
  }

  revalidatePath("/materials");
  revalidatePath(`/materials/${materialId}/edit`);

  redirect("/materials");
}

export async function toggleMaterialStatus(
  materialId: string,
  newStatus: boolean,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .update({
      is_active: newStatus,
    })
    .eq("id", materialId);

  if (error) {
    throw new Error(
      `Unable to change material status: ${error.message}`,
    );
  }

  revalidatePath("/materials");
}