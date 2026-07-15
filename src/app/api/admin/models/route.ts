import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const models = await prisma.deviceModel.findMany({
    include: { brand: { include: { category: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(
    models.map((m) => ({
      id: m.id,
      name: m.name,
      model_code: m.modelCode,
      brand_id: m.brandId,
      slug: m.slug,
      sort_order: m.sortOrder,
      is_active: m.isActive,
      brand_name: m.brand.name,
      category_name: m.brand.category.name,
      category_slug: m.brand.category.slug,
      category_id: m.brand.category.id,
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Batch create: { batch: true, brand_id: number, models: string[] }
  if (body.batch && Array.isArray(body.models)) {
    const results: { name: string; success: boolean; error?: string }[] = [];

    for (const name of body.models) {
      if (!name.trim()) continue;
      try {
        await prisma.deviceModel.create({
          data: {
            name: name.trim(),
            brandId: body.brand_id,
            slug: name.trim().toLowerCase().replace(/[^a-z0-9À-ỹ]+/g, "-").replace(/^-|-$/g, ""),
          },
        });
        results.push({ name: name.trim(), success: true });
      } catch (e: any) {
        results.push({ name: name.trim(), success: false, error: e?.meta?.target ? "Duplicate" : "Error" });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    return NextResponse.json({ results, succeeded, total: results.length });
  }

  // Single create
  const { name, brand_id, model_code, slug } = body;
  const model = await prisma.deviceModel.create({
    data: { name, brandId: brand_id, modelCode: model_code || null, slug },
  });
  return NextResponse.json(model);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, slug, brand_id, is_active } = await request.json();
  await prisma.deviceModel.update({
    where: { id },
    data: {
      ...(name && { name, slug }),
      ...(brand_id && { brandId: brand_id }),
      ...(is_active !== undefined && { isActive: is_active }),
    },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.deviceModel.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
