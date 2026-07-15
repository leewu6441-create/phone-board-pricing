import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { FloatingContact } from "./FloatingContact";
import { getAllSettings } from "@/lib/db/settings";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export async function PublicLayout({ children }: PublicLayoutProps) {
  const settings = await getAllSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <FloatingContact
        zaloLink={settings.zalo_link || "https://zalo.me/your-zalo-phone"}
        facebookLink={settings.facebook_link || "https://facebook.com/groups/your-group"}
        qrcodeImage={settings.qrcode_image || ""}
        wechatId={settings.wechat_id || ""}
        wechatQrcode={settings.wechat_qrcode || ""}
      />
    </div>
  );
}
