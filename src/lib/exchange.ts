// Exchange rate utility
// Uses exchangerate-api.com (free, no key, updates daily at midnight UTC)
// Cache refreshes daily at midnight local time

interface Rates {
  CNY: number;
  USD: number;
}

interface CacheEntry {
  rates: Rates;
  date: string; // YYYY-MM-DD cache date
}

let cache: CacheEntry | null = null;

const API_URL = "https://open.er-api.com/v6/latest/VND";

export async function getExchangeRates(): Promise<Rates> {
  const today = new Date().toISOString().split("T")[0];

  // Return cached if same day
  if (cache && cache.date === today) {
    return cache.rates;
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch rates");

    const data = await res.json();

    if (data.result === "success" && data.rates) {
      cache = {
        rates: {
          CNY: data.rates.CNY,
          USD: data.rates.USD,
        },
        date: today,
      };
      return cache.rates;
    }
    throw new Error("Invalid response");
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    // Return stale cache or fallback
    if (cache) return cache.rates;
    return { CNY: 0.000258, USD: 0.000038 };
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
    case "zh": return "CNY";
    case "en": return "USD";
    default:   return "VND";
  }
}
