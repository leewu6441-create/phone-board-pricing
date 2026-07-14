import { prisma } from "@/lib/prisma";

export async function getAllBrands() {
  const brands = await prisma.brand.findMany({
    include: {
      category: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    category_id: b.categoryId,
    slug: b.slug,
    sort_order: b.sortOrder,
    is_active: b.isActive,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
    category_name: b.category.name,
  }));
}

export async function getBrandsByCategory(categorySlug: string) {
  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
      category: { slug: categorySlug },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    category_id: b.categoryId,
    slug: b.slug,
    sort_order: b.sortOrder,
    is_active: b.isActive,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  }));
}

export async function createBrand(data: {
  category_id: number;
  name: string;
  slug: string;
}) {
  return prisma.brand.create({
    data: {
      categoryId: data.category_id,
      name: data.name,
      slug: data.slug,
    },
  });
}

export async function updateBrand(
  id: number,
  data: { name?: string; category_id?: number; is_active?: boolean }
): Promise<boolean> {
  await prisma.brand.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category_id !== undefined && { categoryId: data.category_id }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
    },
  });
  return true;
}

export async function deleteBrand(id: number): Promise<boolean> {
  await prisma.brand.delete({ where: { id } });
  return true;
}
