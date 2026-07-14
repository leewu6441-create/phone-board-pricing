import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { FloatingContact } from "./FloatingContact";
import { getSetting } from "@/lib/db/settings";
import { DEFAULT_ZALO_LINK, DEFAULT_FACEBOOK_LINK } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase/server";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch settings from DB
  let zaloLink = DEFAULT_ZALO_LINK;
  let facebookLink = DEFAULT_FACEBOOK_LINK;

  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value");

    if (data) {
      data.forEach((item: { key: string; value: string }) => {
        if (item.key === "zalo_link") zaloLink = item.value;
        if (item.key === "facebook_link") facebookLink = item.value;
      });
    }
  } catch {
    // Use defaults
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <FloatingContact zaloLink={zaloLink} facebookLink={facebookLink} />
    </div>
  );
}
