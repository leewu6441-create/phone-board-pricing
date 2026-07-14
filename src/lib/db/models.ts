import { createServerSupabase } from "@/lib/supabase/server";
import type { DeviceModel, ModelWithBrand } from "@/types";

/**
 * Get all device models with brand info.
 */
export async function getAllModels(): Promise<ModelWithBrand[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("device_models")
    .select(
      `
      *,
      brands!inner(
        id, name,
        categories!inner(name)
      )
    `
    )
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("Error fetching models:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    brand_name: item.brands?.name || "",
    category_name: item.brands?.categories?.name || "",
  }));
}

/**
 * Get models by category slug.
 */
export async function getModelsByCategory(
  categorySlug: string
): Promise<DeviceModel[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("device_models")
    .select(
      `
      *,
      brands!inner(
        categories!inner(slug)
      )
    `
    )
    .eq("brands.categories.slug", categorySlug)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("Error fetching models by category:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new device model.
 */
export async function createModel(data: {
  brand_id: number;
  name: string;
  model_code?: string;
  slug: string;
}): Promise<DeviceModel | null> {
  const supabase = await createServerSupabase();

  const { data: result, error } = await supabase
    .from("device_models")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating model:", error);
    return null;
  }

  return result;
}

/**
 * Update a device model.
 */
export async function updateModel(
  id: number,
  data: { name?: string; model_code?: string; brand_id?: number; is_active?: boolean }
): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("device_models")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating model:", error);
    return false;
  }

  return true;
}

/**
 * Delete a device model.
 */
export async function deleteModel(id: number): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("device_models")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting model:", error);
    return false;
  }

  return true;
}

/**
 * Generate a slug from a string.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
