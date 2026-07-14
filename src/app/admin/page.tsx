import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { DollarSign, Smartphone, Tag, History } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { getExchangeRates } from "@/lib/exchange";

export const dynamic = "force-dynamic";

const translations: Record<string, Record<string, string>> = {
  vi: { dashboard: "Bảng điều khiển", totalPrices: "Tổng số giá", totalModels: "Tổng số model", totalBrands: "Tổng số hãng", recentChanges: "Lịch sử thay đổi", recentPriceChanges: "Thay đổi giá gần đây", noChanges: "Chưa có thay đổi nào" },
  en: { dashboard: "Dashboard", totalPrices: "Total Prices", totalModels: "Total Models", totalBrands: "Total Brands", recentChanges: "Recent Changes", recentPriceChanges: "Recent Price Changes", noChanges: "No changes yet" },
  zh: { dashboard: "仪表盘", totalPrices: "价格总数", totalModels: "型号总数", totalBrands: "品牌总数", recentChanges: "变更记录", recentPriceChanges: "最近价格变更", noChanges: "暂无变更" },
};

async function getLangFromCookie(cookieHeader: string): Promise<string> {
  const match = cookieHeader?.match(/lang=([^;]+)/);
  return match ? match[1] : "vi";
}

export default async function AdminDashboardPage() {
  // Note: This is a server component so we can't use useTranslation().
  // We'll use a minimal cookie-based approach for the static labels.
  const t = (key: string) => translations.vi[key] || key;

  const rates = await getExchangeRates();
  const totalPrices = await prisma.priceEntry.count();
  const totalModels = await prisma.deviceModel.count();
  const totalBrands = await prisma.brand.count();
  const recentHistory = await prisma.priceHistory.findMany({ include: { priceEntry: { include: { deviceModel: true } } }, orderBy: { changedAt: "desc" }, take: 10 });

  const stats = [
    { label: t("totalPrices"), value: totalPrices, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: t("totalModels"), value: totalModels, icon: Smartphone, color: "text-blue-600", bg: "bg-blue-100" },
    { label: t("totalBrands"), value: totalBrands, icon: Tag, color: "text-purple-600", bg: "bg-purple-100" },
    { label: t("recentChanges"), value: recentHistory.length, icon: History, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t("dashboard")}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => { const Icon = stat.icon; return (
          <Card key={stat.label}><CardContent className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.bg}`}><Icon size={20} className={stat.color} /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stat.value}</p><p className="text-xs text-gray-500">{stat.label}</p></div>
          </CardContent></Card>
        );})}
      </div>
      <Card><CardHeader><CardTitle className="text-base">{t("recentPriceChanges")}</CardTitle></CardHeader>
        <CardContent>
          {recentHistory.length > 0 ? (
            <div className="space-y-2">
              {recentHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 truncate">{h.priceEntry?.deviceModel?.name || "N/A"} - {h.priceEntry?.variant || "N/A"}</p><p className="text-xs text-gray-500">{h.changedAt.toLocaleString("vi-VN")}</p></div>
                  <div className="text-right shrink-0 ml-3">
                    {h.oldPriceVnd && <span className="text-xs text-gray-400 line-through mr-2">¥{(Number(h.oldPriceVnd) * rates.CNY).toFixed(0)}</span>}
                    <span className="font-semibold text-red-600">¥{(Number(h.newPriceVnd) * rates.CNY).toFixed(0)}</span>
                    <div className="text-[10px] text-gray-400">{formatVnd(Number(h.newPriceVnd))}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-6">{t("noChanges")}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
