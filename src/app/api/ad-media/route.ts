import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idx = parseInt(searchParams.get("idx") || "0");

  // Only fetch the ad_media setting (not all settings) for performance
  const setting = await prisma.siteSetting.findFirst({
    where: { key: { in: ["ad_media", "ad_images"] } },
    orderBy: { key: "desc" }, // prefer ad_media over ad_images
  });

  const raw = setting?.value;
  if (!raw || raw === "[]") {
    return new NextResponse("No media", { status: 404 });
  }

  try {
    const items = JSON.parse(raw);
    const item = items[idx];
    if (!item) return new NextResponse("Not found", { status: 404 });

    const data = typeof item === "string" ? item : item.data;

    // External HTTP URL — redirect
    if (data.startsWith("http")) {
      return NextResponse.redirect(data);
    }

    // Base64 data URL
    if (!data.startsWith("data:")) {
      return new NextResponse("Invalid", { status: 400 });
    }

    const comma = data.indexOf(",");
    const header = data.substring(0, comma);
    const base64 = data.substring(comma + 1);
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Length": buffer.length.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
