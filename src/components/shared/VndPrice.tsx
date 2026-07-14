"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { convertVnd, getCurrencyForLang } from "@/lib/exchange";
import { formatPrice } from "@/lib/format";

interface PriceDisplayProps {
  amount: number; // Always in VND (base currency)
  className?: string;
}

interface Rates { CNY: number; USD: number; }

// Global cache for rates to avoid refetching
let cachedRates: Rates | null = null;
let fetchPromise: Promise<Rates> | null = null;

async function getRates(): Promise<Rates> {
  if (cachedRates) return cachedRates;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/exchange-rates")
    .then((r) => r.json())
    .then((data: Rates) => {
      cachedRates = data;
      fetchPromise = null;
      return data;
    })
    .catch(() => {
      fetchPromise = null;
      return { CNY: 0.000258, USD: 0.000038 }; // fallback
    });

  return fetchPromise;
}

export function VndPrice({ amount, className = "" }: PriceDisplayProps) {
  const { lang } = useTranslation();
  const currency = getCurrencyForLang(lang);
  const [rates, setRates] = useState<Rates | null>(cachedRates);

  useEffect(() => {
    if (!cachedRates) {
      getRates().then(setRates);
    }
  }, []);

  // If currency is VND, no conversion needed
  if (currency === "VND") {
    return (
      <span className={`font-semibold text-red-600 ${className}`}>
        {formatPrice(amount, "VND")}
      </span>
    );
  }

  // Loading state (show VND until rates load)
  if (!rates) {
    return (
      <span className={`font-semibold text-red-600 ${className}`}>
        {formatPrice(amount, "VND")}
      </span>
    );
  }

  const converted = convertVnd(amount, currency, rates);

  return (
    <span className={`font-semibold text-red-600 ${className}`}>
      {formatPrice(converted, currency)}
    </span>
  );
}
