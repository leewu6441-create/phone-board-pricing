import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";
import { DollarSign, Smartphone, Tag, History } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();

  // Fetch counts
  const { count: totalPrices } = await supabase
    .from("price_entries")
    .select("*", { count: "exact", head: true });

  const { count: totalModels } = await supabase
    .from("device_models")
    .select("*", { count: "exact", head: true });

  const { count: totalBrands } = await supabase
    .from("brands")
    .select("*", { count: "exact", head: true });

  // Recent history
  const { data: recentHistory } = await supabase
    .from("price_history")
    .select(
      `
      *,
      price_entries(
        variant,
        device_models(name)
      )
    `
    )
    .order("changed_at", { ascending: false })
    .limit(10);

  const stats = [
    {
      label: "Tổng số giá",
      value: totalPrices || 0,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Tổng số model",
      value: totalModels || 0,
      icon: Smartphone,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Tổng số hãng",
      value: totalBrands || 0,
      icon: Tag,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Lịch sử thay đổi",
      value: (recentHistory || []).length,
      icon: History,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Bảng điều khiển</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thay đổi giá gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {recentHistory && recentHistory.length > 0 ? (
            <div className="space-y-2">
              {recentHistory.map((h: any) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {h.price_entries?.device_models?.name || "N/A"} -{" "}
                      {h.price_entries?.variant || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(h.changed_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {h.old_price_vnd && (
                      <span className="text-xs text-gray-400 line-through mr-2">
                        {(h.old_price_vnd as number).toLocaleString("vi-VN")}
                      </span>
                    )}
                    <span className="font-semibold text-red-600">
                      {(h.new_price_vnd as number).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              Chưa có thay đổi nào
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
