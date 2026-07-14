import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const supabase = await createServerSupabase();

  let query = supabase
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
    .eq("is_active", true)
    .order("sort_order")
    .order("device_model_id");

  if (category) {
    query = query.eq("device_models.brands.categories.slug", category);
  }

  if (search) {
    query = query.or(
      `device_models.name.ilike.%${search}%,device_models.brands.name.ilike.%${search}%,variant.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
