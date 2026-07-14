"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { VndPrice } from "@/components/shared/VndPrice";
import { DateDisplay } from "@/components/shared/DateDisplay";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTranslation } from "@/lib/i18n";
import { Search, ArrowRight, TrendingUp, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceData {
  id: number;
  model_name: string;
  brand_name: string;
  category_slug: string;
  variant: string;
  price_vnd: number;
  updated_at: string;
}

interface HomeClientProps {
  prices: PriceData[];
  noticeText: string;
}

export function HomeClient({ prices, noticeText }: HomeClientProps) {
  const { t } = useTranslation();
  const today = new Date();

  const applePrices = prices.filter((p) => p.category_slug === "apple");
  const androidPrices = prices.filter((p) => p.category_slug === "android");
  const recentPrices = [...prices]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center py-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t("home.title")}</h2>
        <DateDisplay date={today} label={t("home.updatedDate")} className="mt-2 inline-block text-base" />
      </div>

      {noticeText && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">📢 {noticeText}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link href="/apple">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-300">
            <CardContent className="p-5 text-center">
              <Apple className="mx-auto h-10 w-10 text-gray-700 mb-2" />
              <h3 className="text-lg font-bold text-gray-900">Apple</h3>
              <p className="text-sm text-gray-500 mt-1">{t("home.appleModels", { count: applePrices.length })}</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-primary-600 text-sm font-medium">
                {t("home.viewDetail")} <ArrowRight size={14} />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/android">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-300">
            <CardContent className="p-5 text-center">
              <Smartphone className="mx-auto h-10 w-10 text-gray-700 mb-2" />
              <h3 className="text-lg font-bold text-gray-900">Android</h3>
              <p className="text-sm text-gray-500 mt-1">{t("home.androidModels", { count: androidPrices.length })}</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-primary-600 text-sm font-medium">
                {t("home.viewDetail")} <ArrowRight size={14} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Link href="/search">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <span className="text-gray-400 text-sm flex-1">{t("home.searchPlaceholder")}</span>
            <Button variant="ghost" size="sm" className="text-primary-600">{t("home.searchBtn")}</Button>
          </CardContent>
        </Card>
      </Link>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-accent-500" />
          <h3 className="text-lg font-semibold text-gray-900">{t("home.recentUpdates")}</h3>
        </div>

        {recentPrices.length > 0 ? (
          <div className="space-y-2">
            {recentPrices.map((price) => (
              <Card key={price.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{price.brand_name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">
                        {price.category_slug === "apple" ? "🍎" : "🤖"}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm truncate">{price.model_name}</p>
                    <p className="text-xs text-gray-500 truncate">{price.variant}</p>
                  </div>
                  <VndPrice amount={price.price_vnd} className="text-base shrink-0 ml-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title={t("home.noData")} description={t("home.noDataDesc")} />
        )}
      </section>
    </div>
  );
}
