import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Vertex",
    template: "%s | Vertex",
  },
  description: "Vertex - Bảng giá thu mua mainboard điện thoại - Cập nhật mỗi ngày",
  keywords: [
    "vertex",
    "bảng giá mainboard",
    "thu mua mainboard",
    "giá mainboard điện thoại",
    "mainboard iPhone",
    "mainboard Android",
    "thu mua điện thoại",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen font-sans">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: { fontSize: "14px" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
