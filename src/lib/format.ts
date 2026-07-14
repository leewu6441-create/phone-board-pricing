/**
 * Format a number as Vietnamese Dong (VND).
 * Vietnam uses dot as thousand separator.
 */
export function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

/**
 * Format a number as Chinese Yuan (CNY).
 */
export function formatCny(amount: number): string {
  return "¥" + amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format a number as US Dollar (USD).
 */
export function formatUsd(amount: number): string {
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format price in the given currency.
 */
export function formatPrice(amount: number, currency: "VND" | "CNY" | "USD"): string {
  switch (currency) {
    case "CNY": return formatCny(amount);
    case "USD": return formatUsd(amount);
    default: return formatVnd(amount);
  }
}

/**
 * Format a date in Vietnamese format (dd/mm/yyyy).
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get today's date string in YYYY-MM-DD format.
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}
