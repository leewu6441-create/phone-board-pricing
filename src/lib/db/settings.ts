import { createServerSupabase } from "@/lib/supabase/server";
import { DEFAULT_ZALO_LINK, DEFAULT_FACEBOOK_LINK } from "@/lib/constants";

/**
 * Get a single site setting by key.
 */
export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    // Return defaults for known keys
    if (key === "zalo_link") return DEFAULT_ZALO_LINK;
    if (key === "facebook_link") return DEFAULT_FACEBOOK_LINK;
    return null;
  }

  return data.value;
}

/**
 * Get all site settings.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("Error fetching settings:", error);
    return {};
  }

  const settings: Record<string, string> = {};
  (data || []).forEach((item: { key: string; value: string }) => {
    settings[item.key] = item.value;
  });

  return settings;
}

/**
 * Update or insert a site setting.
 */
export async function updateSetting(
  key: string,
  value: string
): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase.from("site_settings").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  if (error) {
    console.error("Error updating setting:", error);
    return false;
  }

  return true;
}
