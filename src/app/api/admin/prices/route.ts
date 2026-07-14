import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all prices
export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prices = await prisma.priceEntry.findMany({
    include: {
      deviceModel: {
        include: { brand: { include: { category: true } } },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { deviceModelId: "asc" }],
  });

  const data = prices.map((p) => ({
    id: p.id,
    device_model_id: p.deviceModelId,
    variant: p.variant,
    price_vnd: Number(p.priceVnd),
    is_active: p.isActive,
    sort_order: p.sortOrder,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
    model_name: p.deviceModel.name,
    brand_name: p.deviceModel.brand.name,
    category_slug: p.deviceModel.brand.category.slug,
  }));

  return NextResponse.json(data);
}

// POST create price
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { device_model_id, variant, price_vnd } = await request.json();

  const price = await prisma.priceEntry.create({
    data: {
      deviceModelId: device_model_id,
      variant: variant || "New variant",
      priceVnd: BigInt(price_vnd || 0),
    },
    include: {
      deviceModel: {
        include: { brand: { include: { category: true } } },
      },
    },
  });

  return NextResponse.json({
    ...price,
    device_model_id: price.deviceModelId,
    price_vnd: Number(price.priceVnd),
    is_active: price.isActive,
    sort_order: price.sortOrder,
    created_at: price.createdAt.toISOString(),
    updated_at: price.updatedAt.toISOString(),
    model_name: price.deviceModel.name,
    brand_name: price.deviceModel.brand.name,
    category_slug: price.deviceModel.brand.category.slug,
  });
}

// PUT update price
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, price_vnd, variant } = await request.json();

  const current = await prisma.priceEntry.findUnique({
    where: { id },
    select: { priceVnd: true },
  });

  const oldPrice = current?.priceVnd ?? null;

  await prisma.priceEntry.update({
    where: { id },
    data: {
      ...(price_vnd !== undefined && { priceVnd: BigInt(price_vnd) }),
      ...(variant !== undefined && { variant }),
    },
  });

  if (price_vnd !== undefined && oldPrice !== BigInt(price_vnd)) {
    await prisma.priceHistory.create({
      data: {
        priceEntryId: id,
        oldPriceVnd: oldPrice,
        newPriceVnd: BigInt(price_vnd),
        changedBy: session.email,
      },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE price
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.priceEntry.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
