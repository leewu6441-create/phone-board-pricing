import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { idx: string } }
) {
  const rawIdx = params.idx;
  // Extract number from "0.mp4" or "0" format
  const idx = parseInt(rawIdx.replace(/\..*$/, ""));
  if (isNaN(idx)) return new NextResponse("Invalid index", { status: 400 });

  const setting = await prisma.siteSetting.findFirst({
    where: { key: { in: ["ad_media", "ad_images"] } },
    orderBy: { key: "desc" },
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

    // External URL redirect
    if (data.startsWith("http")) {
      return NextResponse.redirect(data);
    }

    // Base64 data
    if (!data.startsWith("data:")) {
      return new NextResponse("Invalid", { status: 400 });
    }

    const comma = data.indexOf(",");
    const header = data.substring(0, comma);
    const base64 = data.substring(comma + 1);
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

    // Support Range requests (critical for mobile Safari)
    const rangeHeader = request.headers.get("range");
    const fullBuffer = Buffer.from(base64, "base64");

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fullBuffer.length - 1;
      const chunk = fullBuffer.subarray(start, end + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fullBuffer.length}`,
          "Accept-Ranges": "bytes",
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": chunk.length.toString(),
        },
      });
    }

    return new NextResponse(fullBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}
