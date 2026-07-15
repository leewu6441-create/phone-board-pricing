import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let where: any = {}; // Show all, hide_price controls whether price is visible

  if (category) {
    where.deviceModel = {
      brand: {
        category: { slug: category },
      },
    };
  }

  if (search) {
    const searchLower = search.toLowerCase();
    where.OR = [
      { deviceModel: { name: { contains: searchLower, mode: "insensitive" } } },
      { deviceModel: { brand: { name: { contains: searchLower, mode: "insensitive" } } } },
      { variant: { contains: searchLower, mode: "insensitive" } },
    ];
  }

  const prices = await prisma.priceEntry.findMany({
    where,
    include: {
      deviceModel: {
        include: {
          brand: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { deviceModelId: "asc" }],
  });

  const data = prices.map((p) => ({
    id: p.id,
    device_model_id: p.deviceModelId,
    variant: p.variant,
    price_vnd: Number(p.priceVnd),
    battery_info: p.batteryInfo,
    storage: p.storage,
    region_version: p.regionVersion,
    listing_type: p.listingType,
    is_active: p.isActive,
    model_name: p.deviceModel.name,
    brand_name: p.deviceModel.brand.name,
    category_slug: p.deviceModel.brand.category.slug,
  }));

  return NextResponse.json(data);
}
