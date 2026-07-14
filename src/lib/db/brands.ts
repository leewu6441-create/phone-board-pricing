import { createServerSupabase } from "@/lib/supabase/server";
import type { Brand, BrandWithCategory } from "@/types";

/**
 * Get all brands with category info.
 */
export async function getAllBrands(): Promise<BrandWithCategory[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("brands")
    .select(
      `
      *,
      categories!inner(name)
    `
    )
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    category_name: item.categories?.name || "",
  }));
}

/**
 * Get brands by category slug.
 */
export async function getBrandsByCategory(
  categorySlug: string
): Promise<Brand[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("brands")
    .select(
      `
      *,
      categories!inner(slug)
    `
    )
    .eq("categories.slug", categorySlug)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new brand.
 */
export async function createBrand(data: {
  category_id: number;
  name: string;
  slug: string;
}): Promise<Brand | null> {
  const supabase = await createServerSupabase();

  const { data: result, error } = await supabase
    .from("brands")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating brand:", error);
    return null;
  }

  return result;
}

/**
 * Update a brand.
 */
export async function updateBrand(
  id: number,
  data: { name?: string; category_id?: number; is_active?: boolean }
): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("brands")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating brand:", error);
    return false;
  }

  return true;
}

/**
 * Delete a brand.
 */
export async function deleteBrand(id: number): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase.from("brands").delete().eq("id", id);

  if (error) {
    console.error("Error deleting brand:", error);
    return false;
  }

  return true;
}
