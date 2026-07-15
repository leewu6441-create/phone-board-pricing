import { PublicLayout } from "@/components/layout/PublicLayout";
import { PriceListByCategory } from "@/components/prices/PriceListByCategory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Android 主板 - Thu mua Mainboard",
  description: "Thu mua mainboard Android - Bảng giá thu mua mainboard cập nhật mỗi ngày",
};

export default function AndroidPage() {
  return (
    <PublicLayout>
      <PriceListByCategory categorySlug="android" title="Android" icon="🤖" />
    </PublicLayout>
  );
}
