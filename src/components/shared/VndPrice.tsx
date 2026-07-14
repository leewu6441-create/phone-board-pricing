import { formatVnd } from "@/lib/format";

interface VndPriceProps {
  amount: number;
  className?: string;
}

export function VndPrice({ amount, className = "" }: VndPriceProps) {
  return (
    <span className={`font-semibold text-red-600 ${className}`}>
      {formatVnd(amount)}
    </span>
  );
}
