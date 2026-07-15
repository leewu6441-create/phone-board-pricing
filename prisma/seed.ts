const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  await prisma.category.upsert({
    where: { slug: "apple" },
    update: {},
    create: { name: "Apple", slug: "apple", icon: "🍎", sortOrder: 1 },
  });
  await prisma.category.upsert({
    where: { slug: "android" },
    update: {},
    create: { name: "Android", slug: "android", icon: "🤖", sortOrder: 2 },
  });
  console.log("✓ Categories");

  // Create brands
  const appleCat = await prisma.category.findUnique({ where: { slug: "apple" } });
  const androidCat = await prisma.category.findUnique({ where: { slug: "android" } });

  const brands = [
    { categoryId: appleCat!.id, name: "iPhone", slug: "iphone", sortOrder: 1 },
    { categoryId: androidCat!.id, name: "Samsung", slug: "samsung", sortOrder: 1 },
    { categoryId: androidCat!.id, name: "Xiaomi", slug: "xiaomi", sortOrder: 2 },
    { categoryId: androidCat!.id, name: "OPPO", slug: "oppo", sortOrder: 3 },
    { categoryId: androidCat!.id, name: "Vivo", slug: "vivo", sortOrder: 4 },
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { categoryId_slug: { categoryId: b.categoryId, slug: b.slug } },
      update: {},
      create: b,
    });
  }
  console.log("✓ Brands");

  // Get brand IDs
  const iphone = await prisma.brand.findFirst({ where: { slug: "iphone" } });
  const samsung = await prisma.brand.findFirst({ where: { slug: "samsung" } });
  const xiaomi = await prisma.brand.findFirst({ where: { slug: "xiaomi" } });

  // Create models
  const models = [
    { brandId: iphone!.id, name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", sortOrder: 1 },
    { brandId: iphone!.id, name: "iPhone 15 Pro", slug: "iphone-15-pro", sortOrder: 2 },
    { brandId: iphone!.id, name: "iPhone 15 Plus", slug: "iphone-15-plus", sortOrder: 3 },
    { brandId: iphone!.id, name: "iPhone 15", slug: "iphone-15", sortOrder: 4 },
    { brandId: iphone!.id, name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", sortOrder: 5 },
    { brandId: iphone!.id, name: "iPhone 14 Pro", slug: "iphone-14-pro", sortOrder: 6 },
    { brandId: iphone!.id, name: "iPhone 14 Plus", slug: "iphone-14-plus", sortOrder: 7 },
    { brandId: iphone!.id, name: "iPhone 14", slug: "iphone-14", sortOrder: 8 },
    { brandId: samsung!.id, name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", sortOrder: 1 },
    { brandId: samsung!.id, name: "Galaxy S24+", slug: "galaxy-s24-plus", sortOrder: 2 },
    { brandId: samsung!.id, name: "Galaxy S24", slug: "galaxy-s24", sortOrder: 3 },
    { brandId: samsung!.id, name: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra", sortOrder: 4 },
    { brandId: xiaomi!.id, name: "Xiaomi 14 Ultra", slug: "xiaomi-14-ultra", sortOrder: 1 },
    { brandId: xiaomi!.id, name: "Xiaomi 14", slug: "xiaomi-14", sortOrder: 2 },
  ];

  for (const m of models) {
    await prisma.deviceModel.upsert({
      where: { brandId_slug: { brandId: m.brandId, slug: m.slug } },
      update: {},
      create: m,
    });
  }
  console.log("✓ Models");

  // Get model IDs for sample prices
  const ip15pm = await prisma.deviceModel.findFirst({ where: { slug: "iphone-15-pro-max" } });
  const ip15p = await prisma.deviceModel.findFirst({ where: { slug: "iphone-15-pro" } });
  const s24u = await prisma.deviceModel.findFirst({ where: { slug: "galaxy-s24-ultra" } });

  // Only add sample prices if none exist
  const priceCount = await prisma.priceEntry.count();
  if (priceCount === 0 && ip15pm) {
    const samples = [
      { deviceModelId: ip15pm.id, variant: "256GB | Còn Face ID", priceVnd: BigInt(12500000) },
      { deviceModelId: ip15pm.id, variant: "256GB | Mất Face ID", priceVnd: BigInt(8200000) },
      { deviceModelId: ip15pm.id, variant: "512GB | Còn Face ID", priceVnd: BigInt(14000000) },
      { deviceModelId: ip15pm.id, variant: "512GB | Mất Face ID", priceVnd: BigInt(9500000) },
      { deviceModelId: ip15p.id, variant: "256GB | Còn Face ID", priceVnd: BigInt(10000000) },
      { deviceModelId: ip15p.id, variant: "256GB | Mất Face ID", priceVnd: BigInt(7000000) },
      { deviceModelId: ip15p.id, variant: "128GB | Còn Face ID", priceVnd: BigInt(8500000) },
    ];
    for (const p of samples) {
      await prisma.priceEntry.create({ data: p });
    }
    console.log("✓ Sample prices");
  }

  // Create admin user (only if env var is set)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await prisma.adminUser.create({
        data: { email: adminEmail, passwordHash: hash, displayName: "Admin" },
      });
      console.log(`✓ Admin user: ${adminEmail}`);
    }
  }

  // Default settings
  const defaultSettings = [
    { key: "zalo_link", value: "https://zalo.me/your-zalo-phone" },
    { key: "facebook_link", value: "https://facebook.com/groups/your-group" },
    { key: "notice_text", value: "" },
    { key: "site_name", value: "Vertex" },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✓ Site settings");

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
