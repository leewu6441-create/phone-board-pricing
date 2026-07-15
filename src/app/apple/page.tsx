import { PublicLayout } from "@/components/layout/PublicLayout";
import { ApplePriceList } from "@/components/prices/ApplePriceList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Apple - Bảng giá iPhone",
  description: "Bảng giá bán iPhone chính hãng - Cập nhật mỗi ngày. Đầy đủ thông tin pin, bộ nhớ, phiên bản khu vực.",
};

export default function ApplePage() {
  return (
    <PublicLayout>
      <ApplePriceList />
    </PublicLayout>
  );
}
