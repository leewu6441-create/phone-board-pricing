import { formatDate } from "@/lib/format";

interface DateDisplayProps {
  date: string | Date;
  label?: string;
  className?: string;
}

export function DateDisplay({ date, label, className = "" }: DateDisplayProps) {
  return (
    <span className={`text-sm text-gray-500 ${className}`}>
      {label && <span>{label}: </span>}
      {formatDate(date)}
    </span>
  );
}
