import { NextRequest, NextResponse } from "next/server";
import { getAllSettings } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "zalo" | "wechat"

  const settings = await getAllSettings();

  let imageData: string | null = null;

  if (type === "zalo") {
    imageData = settings.qrcode_image || null;
  } else if (type === "wechat") {
    imageData = settings.wechat_qrcode || null;
  }

  if (!imageData) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // If it's a base64 data URL, extract and serve it
  if (imageData.startsWith("data:")) {
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const base64 = matches[2];
      const buffer = Buffer.from(base64, "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  }

  // If it's a URL, redirect to it
  if (imageData.startsWith("http")) {
    return NextResponse.redirect(imageData);
  }

  return new NextResponse("Invalid", { status: 400 });
}
