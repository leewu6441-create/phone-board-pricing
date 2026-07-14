import { PublicLayout } from "@/components/layout/PublicLayout";
import { PriceListByCategory } from "@/components/prices/PriceListByCategory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Apple - Bảng giá Mainboard iPhone",
  description: "Bảng giá thu mua mainboard iPhone - Cập nhật mỗi ngày",
};

export default function ApplePage() {
  return (
    <PublicLayout>
      <PriceListByCategory categorySlug="apple" title="Apple" icon="🍎" />
    </PublicLayout>
  );
}
