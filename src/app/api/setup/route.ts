import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Create categories
    const apple = await prisma.category.upsert({
      where: { slug: "apple" },
      update: {},
      create: { name: "Apple", slug: "apple", icon: "🍎", sortOrder: 1 },
    });
    const android = await prisma.category.upsert({
      where: { slug: "android" },
      update: {},
      create: { name: "Android", slug: "android", icon: "🤖", sortOrder: 2 },
    });

    // Create brands
    const iphone = await prisma.brand.upsert({
      where: { categoryId_slug: { categoryId: apple.id, slug: "iphone" } },
      update: {},
      create: { categoryId: apple.id, name: "iPhone", slug: "iphone", sortOrder: 1 },
    });
    const samsung = await prisma.brand.upsert({
      where: { categoryId_slug: { categoryId: android.id, slug: "samsung" } },
      update: {},
      create: { categoryId: android.id, name: "Samsung", slug: "samsung", sortOrder: 1 },
    });
    const xiaomi = await prisma.brand.upsert({
      where: { categoryId_slug: { categoryId: android.id, slug: "xiaomi" } },
      update: {},
      create: { categoryId: android.id, name: "Xiaomi", slug: "xiaomi", sortOrder: 2 },
    });
    await prisma.brand.upsert({
      where: { categoryId_slug: { categoryId: android.id, slug: "oppo" } },
      update: {},
      create: { categoryId: android.id, name: "OPPO", slug: "oppo", sortOrder: 3 },
    });
    await prisma.brand.upsert({
      where: { categoryId_slug: { categoryId: android.id, slug: "vivo" } },
      update: {},
      create: { categoryId: android.id, name: "Vivo", slug: "vivo", sortOrder: 4 },
    });

    // Create models
    const models = [
      { brandId: iphone.id, name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", sortOrder: 1 },
      { brandId: iphone.id, name: "iPhone 15 Pro", slug: "iphone-15-pro", sortOrder: 2 },
      { brandId: iphone.id, name: "iPhone 15 Plus", slug: "iphone-15-plus", sortOrder: 3 },
      { brandId: iphone.id, name: "iPhone 15", slug: "iphone-15", sortOrder: 4 },
      { brandId: iphone.id, name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", sortOrder: 5 },
      { brandId: iphone.id, name: "iPhone 14 Pro", slug: "iphone-14-pro", sortOrder: 6 },
      { brandId: iphone.id, name: "iPhone 14 Plus", slug: "iphone-14-plus", sortOrder: 7 },
      { brandId: iphone.id, name: "iPhone 14", slug: "iphone-14", sortOrder: 8 },
      { brandId: samsung.id, name: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", sortOrder: 1 },
      { brandId: samsung.id, name: "Galaxy S24+", slug: "galaxy-s24-plus", sortOrder: 2 },
      { brandId: samsung.id, name: "Galaxy S24", slug: "galaxy-s24", sortOrder: 3 },
      { brandId: samsung.id, name: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra", sortOrder: 4 },
      { brandId: xiaomi.id, name: "Xiaomi 14 Ultra", slug: "xiaomi-14-ultra", sortOrder: 1 },
      { brandId: xiaomi.id, name: "Xiaomi 14", slug: "xiaomi-14", sortOrder: 2 },
    ];

    for (const m of models) {
      await prisma.deviceModel.upsert({
        where: { brandId_slug: { brandId: m.brandId, slug: m.slug } },
        update: {},
        create: m,
      });
    }

    // Sample prices for iPhone 15 Pro Max
    const ip15pm = await prisma.deviceModel.findFirst({ where: { slug: "iphone-15-pro-max" } });
    const ip15p = await prisma.deviceModel.findFirst({ where: { slug: "iphone-15-pro" } });

    const priceCount = await prisma.priceEntry.count();
    if (priceCount === 0 && ip15pm && ip15p) {
      const samples = [
        { deviceModelId: ip15pm.id, variant: "256GB | Còn Face ID", priceVnd: 12500000n },
        { deviceModelId: ip15pm.id, variant: "256GB | Mất Face ID", priceVnd: 8200000n },
        { deviceModelId: ip15pm.id, variant: "512GB | Còn Face ID", priceVnd: 14000000n },
        { deviceModelId: ip15pm.id, variant: "512GB | Mất Face ID", priceVnd: 9500000n },
        { deviceModelId: ip15p.id, variant: "256GB | Còn Face ID", priceVnd: 10000000n },
        { deviceModelId: ip15p.id, variant: "256GB | Mất Face ID", priceVnd: 7000000n },
        { deviceModelId: ip15p.id, variant: "128GB | Còn Face ID", priceVnd: 8500000n },
      ];
      for (const p of samples) {
        await prisma.priceEntry.create({ data: p });
      }
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    let adminCreated = false;

    if (adminEmail && adminPassword) {
      const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
      if (!existing) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await prisma.adminUser.create({
          data: { email: adminEmail, passwordHash: hash, displayName: "Admin" },
        });
        adminCreated = true;
      }
    }

    // Default settings
    const settings = [
      { key: "zalo_link", value: "https://zalo.me/your-zalo-phone" },
      { key: "facebook_link", value: "https://facebook.com/groups/your-group" },
      { key: "notice_text", value: "" },
      { key: "site_name", value: "Bảng Giá Mainboard" },
    ];
    for (const s of settings) {
      await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      adminCreated,
      modelCount: await prisma.deviceModel.count(),
      priceCount: await prisma.priceEntry.count(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
