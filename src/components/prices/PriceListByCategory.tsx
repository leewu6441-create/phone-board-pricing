"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VndPrice } from "@/components/shared/VndPrice";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateDisplay } from "@/components/shared/DateDisplay";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PriceData {
  id: number; device_model_id: number; variant: string; price_vnd: number;
  model_name: string; brand_name: string; category_slug: string;
}

interface PriceListByCategoryProps { categorySlug: string; title: string; icon: string; }

export function PriceListByCategory({ categorySlug, title, icon }: PriceListByCategoryProps) {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`/api/prices?category=${categorySlug}`)
      .then((r) => r.json())
      .then((data) => {
        setPrices(data);
        if (data[0]?.device_model_id) setExpandedModels(new Set([data[0].device_model_id]));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categorySlug]);

  const grouped: Record<number, PriceData[]> = {};
  prices.forEach((p) => { if (!grouped[p.device_model_id]) grouped[p.device_model_id] = []; grouped[p.device_model_id].push(p); });

  const sl = search.toLowerCase();
  const filtered = Object.entries(grouped).filter(([, prices]) => {
    const p = prices[0];
    return p.model_name.toLowerCase().includes(sl) || p.brand_name.toLowerCase().includes(sl) || prices.some((pr) => pr.variant.toLowerCase().includes(sl));
  });

  const toggle = (id: number) => setExpandedModels((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const expandAll = () => setExpandedModels(new Set(Object.keys(grouped).map(Number)));

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse"><div className="h-12 bg-gray-200 rounded-lg mb-2" /><div className="h-16 bg-gray-100 rounded-lg" /></div>)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Recycling Banner for Android */}
      {categorySlug === "android" && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2.5">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6V18ZM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8ZM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5ZM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.3,1.3C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84Z"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{title}</h2>
                <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t("home.recycling")}</span>
              </div>
              <p className="text-orange-100 text-sm mt-0.5">{t("android.subtitle")}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{icon} {title}</h2>
          <DateDisplay date={new Date()} label={t("price.updated")} className="mt-1" />
        </div>
        {Object.keys(grouped).length > 1 && <button onClick={expandAll} className="text-xs text-primary-600 hover:underline">{t("price.expandAll")}</button>}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder={t("price.filterByName")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {search && <p className="text-sm text-gray-500">{t("price.foundModels", { count: filtered.length })}</p>}

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(([mid, mprices]) => {
            const p = mprices[0]; const midN = Number(mid); const isExp = expandedModels.has(midN);
            return (
              <Card key={mid} className="overflow-hidden">
                <button onClick={() => toggle(midN)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{p.brand_name}</span>
                      <h3 className="font-semibold text-gray-900">{p.model_name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{t("price.versions", { count: mprices.length })}</p>
                  </div>
                  {isExp ? <ChevronDown size={18} className="text-gray-400 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
                </button>
                <div className={cn("divide-y divide-gray-100", isExp ? "block" : "hidden")}>
                  {mprices.map((pr) => (
                    <div key={pr.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                      <span className="text-sm text-gray-700 flex-1 min-w-0 pr-3">{pr.variant}</span>
                      <VndPrice amount={pr.price_vnd} className="text-base shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title={search ? t("price.notFound") : t("price.noData")} description={search ? t("price.notFoundDesc", { query: search }) : t("price.noDataDesc")} />
      )}
    </div>
  );
}
