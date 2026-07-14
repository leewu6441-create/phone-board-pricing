import { PublicLayout } from "@/components/layout/PublicLayout";
import { PriceListByCategory } from "@/components/prices/PriceListByCategory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Android - Bảng giá Mainboard Android",
  description: "Bảng giá thu mua mainboard Android - Cập nhật mỗi ngày",
};

export default function AndroidPage() {
  return (
    <PublicLayout>
      <PriceListByCategory categorySlug="android" title="Android" icon="🤖" />
    </PublicLayout>
  );
}
