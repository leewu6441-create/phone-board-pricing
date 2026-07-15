import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { idx: string } }
) {
  const idx = parseInt(params.idx.replace(/\..*$/, ""));
  if (isNaN(idx)) return new NextResponse("Invalid", { status: 400 });

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

    if (!data.startsWith("data:")) {
      return new NextResponse("Invalid", { status: 400 });
    }

    const comma = data.indexOf(",");
    const header = data.substring(0, comma);
    const base64 = data.substring(comma + 1);
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const buffer = Buffer.from(base64, "base64");

    // For images: return binary directly so <img> tags work
    // For videos: return binary (video elements handle it)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
