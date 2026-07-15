import { prisma } from "@/lib/prisma";

export interface PriceRowWithModel {
  id: number;
  device_model_id: number;
  variant: string;
  price_vnd: number;
  is_active: boolean;
  battery_info: string | null;
  storage: string | null;
  region_version: string | null;
  listing_type: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  model_name: string;
  brand_name: string;
  category_slug: string;
}

export async function getPricesByCategory(
  categorySlug: string
): Promise<PriceRowWithModel[]> {
  const prices = await prisma.priceEntry.findMany({
    where: {
      deviceModel: {
        brand: {
          category: { slug: categorySlug },
        },
      },
    },
    include: {
      deviceModel: {
        include: {
          brand: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { deviceModelId: "asc" }],
  });

  return prices.map((p) => ({
    id: p.id,
    device_model_id: p.deviceModelId,
    variant: p.variant,
    price_vnd: Number(p.priceVnd),
    is_active: p.isActive,
    battery_info: p.batteryInfo,
    storage: p.storage,
    region_version: p.regionVersion,
    listing_type: p.listingType,
    sort_order: p.sortOrder,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
    model_name: p.deviceModel.name,
    brand_name: p.deviceModel.brand.name,
    category_slug: p.deviceModel.brand.category.slug,
  }));
}

export async function getAllPrices(): Promise<PriceRowWithModel[]> {
  const prices = await prisma.priceEntry.findMany({
    include: {
      deviceModel: {
        include: {
          brand: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { deviceModelId: "asc" }],
  });

  return prices.map((p) => ({
    id: p.id,
    device_model_id: p.deviceModelId,
    variant: p.variant,
    price_vnd: Number(p.priceVnd),
    is_active: p.isActive,
    battery_info: p.batteryInfo,
    storage: p.storage,
    region_version: p.regionVersion,
    listing_type: p.listingType,
    sort_order: p.sortOrder,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
    model_name: p.deviceModel.name,
    brand_name: p.deviceModel.brand.name,
    category_slug: p.deviceModel.brand.category.slug,
  }));
}

export async function updatePrice(
  id: number,
  priceVnd: number,
  adminEmail: string
): Promise<boolean> {
  const current = await prisma.priceEntry.findUnique({
    where: { id },
    select: { priceVnd: true },
  });

  const oldPrice = current?.priceVnd ?? null;

  await prisma.priceEntry.update({
    where: { id },
    data: { priceVnd: BigInt(priceVnd) },
  });

  // Record history
  if (oldPrice !== BigInt(priceVnd)) {
    await prisma.priceHistory.create({
      data: {
        priceEntryId: id,
        oldPriceVnd: oldPrice,
        newPriceVnd: BigInt(priceVnd),
        changedBy: adminEmail,
      },
    });
  }

  return true;
}

export async function createPrice(data: {
  device_model_id: number;
  variant: string;
  price_vnd: number;
  battery_info?: string;
  storage?: string;
  region_version?: string;
  listing_type?: string;
}) {
  return prisma.priceEntry.create({
    data: {
      deviceModelId: data.device_model_id,
      variant: data.variant,
      priceVnd: BigInt(data.price_vnd),
      batteryInfo: data.battery_info || null,
      storage: data.storage || null,
      regionVersion: data.region_version || null,
      listingType: data.listing_type || "recycle",
    },
  });
}

export async function deletePrice(id: number): Promise<boolean> {
  await prisma.priceEntry.delete({ where: { id } });
  return true;
}
