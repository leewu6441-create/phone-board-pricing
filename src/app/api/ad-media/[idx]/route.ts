import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { idx: string } }
) {
  const idx = parseInt(params.idx.replace(/\..*$/, ""));
  if (isNaN(idx)) return new NextResponse("Invalid index", { status: 400 });

  const setting = await prisma.siteSetting.findFirst({
    where: { key: { in: ["ad_media", "ad_images"] } },
    orderBy: { key: "desc" },
  });

  const raw = setting?.value;
  if (!raw || raw === "[]") return new NextResponse("No media", { status: 404 });

  try {
    const items = JSON.parse(raw);
    const item = items[idx];
    if (!item) return new NextResponse("Not found", { status: 404 });

    const data = typeof item === "string" ? item : item.data;

    // External URL: redirect
    if (data.startsWith("http")) {
      return NextResponse.redirect(data);
    }

    // Return the raw data URL as text
    return new NextResponse(data, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
