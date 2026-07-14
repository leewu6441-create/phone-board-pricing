import { PublicLayout } from "@/components/layout/PublicLayout";
import { HomeClient } from "@/components/prices/HomeClient";
import { getAllPrices } from "@/lib/db/prices";
import { getSetting } from "@/lib/db/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let prices: any[] = [];
  let noticeText = "";

  try {
    prices = await getAllPrices();
    noticeText = (await getSetting("notice_text")) || "";
  } catch {
    // Will show empty state
  }

  return (
    <PublicLayout>
      <HomeClient prices={prices} noticeText={noticeText} />
    </PublicLayout>
  );
}
