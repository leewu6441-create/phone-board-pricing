"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VndPrice } from "@/components/shared/VndPrice";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateDisplay } from "@/components/shared/DateDisplay";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceData {
  id: number;
  device_model_id: number;
  variant: string;
  price_vnd: number;
  model_name: string;
  brand_name: string;
  category_slug: string;
}

interface PriceListByCategoryProps {
  categorySlug: string;
  title: string;
  icon: string;
}

export function PriceListByCategory({ categorySlug, title, icon }: PriceListByCategoryProps) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`/api/prices?category=${categorySlug}`)
      .then((r) => r.json())
      .then((data) => {
        setPrices(data);
        // Expand first model by default
        const firstId = data[0]?.device_model_id;
        if (firstId) setExpandedModels(new Set([firstId]));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categorySlug]);

  // Group by model
  const grouped: Record<number, PriceData[]> = {};
  prices.forEach((p) => {
    if (!grouped[p.device_model_id]) grouped[p.device_model_id] = [];
    grouped[p.device_model_id].push(p);
  });

  const searchLower = search.toLowerCase();
  const filteredGroups = Object.entries(grouped).filter(([, prices]) => {
    const p = prices[0];
    return p.model_name.toLowerCase().includes(searchLower) || p.brand_name.toLowerCase().includes(searchLower) || prices.some((pr) => pr.variant.toLowerCase().includes(searchLower));
  });

  const toggleModel = (modelId: number) => {
    setExpandedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
  };

  const expandAll = () => setExpandedModels(new Set(Object.keys(grouped).map(Number)));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse"><div className="h-12 bg-gray-200 rounded-lg mb-2" /><div className="h-16 bg-gray-100 rounded-lg" /></div>)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{icon} {title}</h2>
          <DateDisplay date={new Date()} label="Cập nhật" className="mt-1" />
        </div>
        {Object.keys(grouped).length > 1 && <button onClick={expandAll} className="text-xs text-primary-600 hover:underline">Mở tất cả</button>}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Tìm theo tên máy, hãng..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {search && <p className="text-sm text-gray-500">Tìm thấy {filteredGroups.length} model</p>}

      {filteredGroups.length > 0 ? (
        <div className="space-y-3">
          {filteredGroups.map(([modelId, modelPrices]) => {
            const p = modelPrices[0];
            const modelIdNum = Number(modelId);
            const isExpanded = expandedModels.has(modelIdNum);
            return (
              <Card key={modelId} className="overflow-hidden">
                <button onClick={() => toggleModel(modelIdNum)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{p.brand_name}</span>
                      <h3 className="font-semibold text-gray-900">{p.model_name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{modelPrices.length} phiên bản</p>
                  </div>
                  {isExpanded ? <ChevronDown size={18} className="text-gray-400 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
                </button>
                <div className={cn("divide-y divide-gray-100 transition-all duration-300", isExpanded ? "block" : "hidden")}>
                  {modelPrices.map((price) => (
                    <div key={price.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                      <span className="text-sm text-gray-700 flex-1 min-w-0 pr-3">{price.variant}</span>
                      <VndPrice amount={price.price_vnd} className="text-base shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title={search ? "Không tìm thấy" : "Chưa có dữ liệu"} description={search ? `Không có kết quả cho "${search}"` : "Bảng giá đang được cập nhật."} />
      )}
    </div>
  );
}
