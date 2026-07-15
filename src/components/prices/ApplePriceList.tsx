"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VndPrice } from "@/components/shared/VndPrice";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateDisplay } from "@/components/shared/DateDisplay";
import { Search, Battery, HardDrive, Globe, Tag } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface PriceData {
  id: number;
  device_model_id: number;
  variant: string;
  price_vnd: number;
  battery_info: string | null;
  storage: string | null;
  region_version: string | null;
  listing_type: string | null;
  is_active: boolean;
  model_name: string;
  brand_name: string;
  category_slug: string;
}

export function ApplePriceList() {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prices?category=apple")
      .then((r) => r.json())
      .then((data) => { setPrices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const sl = search.toLowerCase();
  const filtered = prices.filter((p) =>
    p.model_name.toLowerCase().includes(sl) ||
    p.brand_name.toLowerCase().includes(sl) ||
    p.variant.toLowerCase().includes(sl) ||
    (p.storage && p.storage.toLowerCase().includes(sl)) ||
    (p.region_version && p.region_version.toLowerCase().includes(sl))
  );

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse"><div className="h-48 bg-gray-200 rounded-xl" /></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Selling Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2.5">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.24 4.34 13 3.5Z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{t("apple.title")}</h2>
              <span className="bg-white text-green-600 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t("home.selling")}</span>
            </div>
            <p className="text-green-100 text-sm mt-0.5">{t("apple.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <DateDisplay date={new Date()} label={t("price.updated")} className="mt-1" />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder={t("price.filterByName")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {search && <p className="text-sm text-gray-500">{t("price.foundModels", { count: filtered.length })}</p>}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
              {/* Header - Model name & brand */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">{p.brand_name}</p>
                <h3 className="font-bold text-base mt-0.5">{p.model_name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{p.variant}</p>
              </div>

              {/* Specs */}
              <div className="p-4 space-y-2">
                {p.storage && (
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive size={15} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600 w-16 text-xs">{t("apple.storage")}</span>
                    <span className="font-medium text-gray-900">{p.storage}</span>
                  </div>
                )}
                {p.battery_info && (
                  <div className="flex items-center gap-2 text-sm">
                    <Battery size={15} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600 w-16 text-xs">{t("apple.battery")}</span>
                    <span className="font-medium text-gray-900">{p.battery_info}</span>
                  </div>
                )}
                {p.region_version && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={15} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600 w-16 text-xs">{t("apple.region")}</span>
                    <span className="font-medium text-gray-900">{p.region_version}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className={`border-t px-4 py-3.5 flex items-center justify-between ${p.is_active ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center gap-1.5">
                  <Tag size={14} className={p.is_active ? "text-green-600" : "text-gray-400"} />
                  <span className={`font-bold text-sm uppercase tracking-wide ${p.is_active ? "text-green-700" : "text-gray-500"}`}>{t("apple.salePrice")}</span>
                </div>
                {p.is_active ? (
                  <VndPrice amount={p.price_vnd} className="text-xl" />
                ) : (
                  <span className="text-red-500 font-bold text-sm">{t("price.contactUs")}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search ? t("price.notFound") : t("price.noData")}
          description={search ? t("price.notFoundDesc", { query: search }) : t("price.noDataDesc")}
        />
      )}
    </div>
  );
}
