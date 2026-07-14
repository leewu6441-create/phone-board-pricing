import { prisma } from "@/lib/prisma";

export async function getAllModels() {
  const models = await prisma.deviceModel.findMany({
    include: {
      brand: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return models.map((m) => ({
    id: m.id,
    name: m.name,
    model_code: m.modelCode,
    brand_id: m.brandId,
    slug: m.slug,
    sort_order: m.sortOrder,
    is_active: m.isActive,
    created_at: m.createdAt.toISOString(),
    updated_at: m.updatedAt.toISOString(),
    brand_name: m.brand.name,
    category_name: m.brand.category.name,
    category_id: m.brand.category.id,
  }));
}

export async function getModelsByCategory(categorySlug: string) {
  const models = await prisma.deviceModel.findMany({
    where: {
      isActive: true,
      brand: {
        category: { slug: categorySlug },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return models.map((m) => ({
    id: m.id,
    name: m.name,
    brand_id: m.brandId,
    slug: m.slug,
    sort_order: m.sortOrder,
    is_active: m.isActive,
    model_code: m.modelCode,
    created_at: m.createdAt.toISOString(),
    updated_at: m.updatedAt.toISOString(),
  }));
}

export async function createModel(data: {
  brand_id: number;
  name: string;
  model_code?: string;
  slug: string;
}) {
  return prisma.deviceModel.create({
    data: {
      brandId: data.brand_id,
      name: data.name,
      modelCode: data.model_code || null,
      slug: data.slug,
    },
  });
}

export async function updateModel(
  id: number,
  data: { name?: string; model_code?: string; brand_id?: number; is_active?: boolean }
): Promise<boolean> {
  await prisma.deviceModel.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.model_code !== undefined && { modelCode: data.model_code }),
      ...(data.brand_id !== undefined && { brandId: data.brand_id }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
    },
  });
  return true;
}

export async function deleteModel(id: number): Promise<boolean> {
  await prisma.deviceModel.delete({ where: { id } });
  return true;
}
