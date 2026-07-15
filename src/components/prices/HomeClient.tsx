"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { VndPrice } from "@/components/shared/VndPrice";
import { DateDisplay } from "@/components/shared/DateDisplay";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTranslation } from "@/lib/i18n";
import { Search, ArrowRight, TrendingUp } from "lucide-react";
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
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-gray-300">
            <CardContent className="p-5 text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10 text-gray-900 mb-2" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.24 4.34 13 3.5Z"/></svg>
              <h3 className="text-lg font-bold text-gray-900">Apple</h3>
              <p className="text-sm text-gray-500 mt-1">{t("home.appleModels", { count: applePrices.length })}</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-primary-600 text-sm font-medium">
                {t("home.viewDetail")} <ArrowRight size={14} />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/android">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-green-300">
            <CardContent className="p-5 text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10 text-green-600 mb-2" fill="currentColor"><path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6V18ZM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8ZM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5ZM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.3,1.3C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84Z"/></svg>
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
