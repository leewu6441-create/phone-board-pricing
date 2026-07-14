import { SITE_NAME } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {SITE_NAME}. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-xs text-gray-400">
            Bảng giá chỉ mang tính tham khảo. Vui lòng liên hệ qua Zalo để được báo giá chính xác.
          </p>
        </div>
      </div>
    </footer>
  );
}
