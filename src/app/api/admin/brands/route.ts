import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brands = await prisma.brand.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const modelCounts = await prisma.deviceModel.groupBy({
    by: ["brandId"],
    _count: { id: true },
  });
  const countMap: Record<number, number> = {};
  modelCounts.forEach((m: any) => {
    countMap[m.brandId] = m._count.id;
  });

  return NextResponse.json(
    brands.map((b) => ({
      id: b.id,
      name: b.name,
      category_id: b.categoryId,
      slug: b.slug,
      is_active: b.isActive,
      category_name: b.category.name,
      _count: countMap[b.id] || 0,
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category_id, slug } = await request.json();
  const brand = await prisma.brand.create({
    data: { name, categoryId: category_id, slug },
  });
  return NextResponse.json(brand);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, slug, category_id, is_active } = await request.json();
  await prisma.brand.update({
    where: { id },
    data: {
      ...(name && { name, slug }),
      ...(category_id && { categoryId: category_id }),
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

  await prisma.brand.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
