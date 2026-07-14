import { createServerSupabase } from "@/lib/supabase/server";
import type { PriceEntry, PriceFilter, PriceRowWithModel } from "@/types";

/**
 * Get all prices with model and brand info, filtered by category.
 */
export async function getPricesByCategory(
  categorySlug: string
): Promise<PriceRowWithModel[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("price_entries")
    .select(
      `
      *,
      device_models!inner(
        id, name, brand_id,
        brands!inner(
          id, name,
          categories!inner(slug)
        )
      )
    `
    )
    .eq("device_models.brands.categories.slug", categorySlug)
    .eq("is_active", true)
    .order("sort_order")
    .order("device_model_id");

  if (error) {
    console.error("Error fetching prices:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    model_name: item.device_models?.name || "",
    brand_name: item.device_models?.brands?.name || "",
    category_slug: item.device_models?.brands?.categories?.slug || "",
  }));
}

/**
 * Get all prices (for admin).
 */
export async function getAllPrices(): Promise<PriceRowWithModel[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("price_entries")
    .select(
      `
      *,
      device_models!inner(
        id, name, brand_id,
        brands!inner(
          id, name,
          categories!inner(slug)
        )
      )
    `
    )
    .order("sort_order")
    .order("device_model_id");

  if (error) {
    console.error("Error fetching all prices:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    model_name: item.device_models?.name || "",
    brand_name: item.device_models?.brands?.name || "",
    category_slug: item.device_models?.brands?.categories?.slug || "",
  }));
}

/**
 * Update a single price entry.
 */
export async function updatePrice(
  id: number,
  priceVnd: number,
  adminEmail: string
): Promise<boolean> {
  const supabase = await createServerSupabase();

  // Get current price for history
  const { data: current } = await supabase
    .from("price_entries")
    .select("price_vnd")
    .eq("id", id)
    .single();

  const oldPrice = current?.price_vnd || null;

  // Update price
  const { error } = await supabase
    .from("price_entries")
    .update({ price_vnd: priceVnd, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating price:", error);
    return false;
  }

  // Record history
  if (oldPrice !== priceVnd) {
    await supabase.from("price_history").insert({
      price_entry_id: id,
      old_price_vnd: oldPrice,
      new_price_vnd: priceVnd,
      changed_by: adminEmail,
    });
  }

  return true;
}

/**
 * Create a new price entry.
 */
export async function createPrice(data: {
  device_model_id: number;
  variant: string;
  price_vnd: number;
}): Promise<PriceEntry | null> {
  const supabase = await createServerSupabase();

  const { data: result, error } = await supabase
    .from("price_entries")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating price:", error);
    return null;
  }

  return result;
}

/**
 * Delete a price entry.
 */
export async function deletePrice(id: number): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase.from("price_entries").delete().eq("id", id);

  if (error) {
    console.error("Error deleting price:", error);
    return false;
  }

  return true;
}
