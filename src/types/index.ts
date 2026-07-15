// ============================================================
// Database Types
// ============================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceModel {
  id: number;
  brand_id: number;
  name: string;
  model_code: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  brand_name?: string;
  category_name?: string;
  category_slug?: string;
}

export interface PriceEntry {
  id: number;
  device_model_id: number;
  variant: string;
  price_vnd: number;
  battery_info: string | null;
  storage: string | null;
  region_version: string | null;
  listing_type: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  model_name?: string;
  brand_name?: string;
  category_slug?: string;
}

export interface PriceHistory {
  id: number;
  price_entry_id: number;
  old_price_vnd: number | null;
  new_price_vnd: number;
  changed_by: string;
  changed_at: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

// ============================================================
// UI Types
// ============================================================

export interface PriceRowWithModel extends PriceEntry {
  model_name: string;
  brand_name: string;
  category_slug: string;
}

export interface ModelWithBrand extends DeviceModel {
  brand_name: string;
  category_name: string;
}

export interface BrandWithCategory extends Brand {
  category_name: string;
}

// ============================================================
// Filter Types
// ============================================================

export type CategorySlug = "apple" | "android";

export interface PriceFilter {
  category?: CategorySlug;
  brand_id?: number;
  model_id?: number;
  search?: string;
}
