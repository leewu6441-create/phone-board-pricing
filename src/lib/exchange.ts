// Exchange rate caching utility
// Uses Frankfurter API (free, no API key required)

interface Rates {
  CNY: number;
  USD: number;
}

interface CacheEntry {
  rates: Rates;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getExchangeRates(): Promise<Rates> {
  // Return cached if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.rates;
  }

  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=VND&to=USD,CNY");
    if (!res.ok) throw new Error("Failed to fetch rates");

    const data = await res.json();

    cache = {
      rates: {
        CNY: data.rates.CNY,
        USD: data.rates.USD,
      },
      timestamp: Date.now(),
    };

    return cache.rates;
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    // Return stale cache if available, otherwise fallback rates
    if (cache) return cache.rates;

    // Fallback rates (approximate, updated manually)
    return { CNY: 0.00029, USD: 0.00004 };
  }
}

export function convertVnd(
  amountVnd: number,
  currency: "VND" | "CNY" | "USD",
  rates: Rates
): number {
  if (currency === "VND") return amountVnd;
  return Math.round(amountVnd * rates[currency] * 100) / 100;
}

export function getCurrencyForLang(lang: string): "VND" | "CNY" | "USD" {
  switch (lang) {
    case "zh":
      return "CNY";
    case "en":
      return "USD";
    default:
      return "VND";
  }
}
