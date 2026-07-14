"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VndPrice } from "@/components/shared/VndPrice";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_ZALO_LINK, DEFAULT_FACEBOOK_LINK } from "@/lib/constants";
import type { PriceRowWithModel } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PriceRowWithModel[]>([]);
  const [allPrices, setAllPrices] = useState<PriceRowWithModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("price_entries")
        .select(
          `
          *,
          device_models!inner(
            id, name, brand_id,
            brands!inner(
              id, name,
              categories!inner(slug)
            )
          )
        `
        )
        .eq("is_active", true)
        .order("sort_order");

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          ...item,
          model_name: item.device_models?.name || "",
          brand_name: item.device_models?.brands?.name || "",
          category_slug: item.device_models?.brands?.categories?.slug || "",
        }));
        setAllPrices(formatted);
      }
      setLoading(false);
    };

    fetchPrices();
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const filtered = allPrices.filter(
        (p) =>
          p.model_name.toLowerCase().includes(lower) ||
          p.brand_name.toLowerCase().includes(lower) ||
          p.variant.toLowerCase().includes(lower)
      );
      setResults(filtered);
    },
    [allPrices]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            🔍 Tìm kiếm
          </h2>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Nhập tên máy, hãng hoặc phiên bản..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>

          {/* Results Count */}
          {query && (
            <p className="text-sm text-gray-500">
              {results.length > 0
                ? `Tìm thấy ${results.length} kết quả cho "${query}"`
                : `Không tìm thấy kết quả cho "${query}"`}
            </p>
          )}

          {/* Results */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : query && results.length > 0 ? (
            <div className="space-y-2">
              {results.map((price) => (
                <Card key={price.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          {price.brand_name}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
                          {price.category_slug === "apple" ? "🍎 Apple" : "🤖 Android"}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">
                        {price.model_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {price.variant}
                      </p>
                    </div>
                    <VndPrice
                      amount={price.price_vnd}
                      className="text-base shrink-0 ml-3"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query && results.length === 0 ? (
            <EmptyState
              title="Không tìm thấy"
              description={`Không có kết quả nào cho "${query}". Vui lòng thử từ khóa khác.`}
            />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Search className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p>Nhập tên máy hoặc hãng để tìm kiếm</p>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
      <FloatingContact
        zaloLink={DEFAULT_ZALO_LINK}
        facebookLink={DEFAULT_FACEBOOK_LINK}
      />
    </div>
  );
}
