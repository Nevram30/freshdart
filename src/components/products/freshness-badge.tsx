import { Leaf, Clock, XCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { getDaysUntilExpiry } from "~/lib/utils";
import { getFreshnessLevel, getFreshnessInfo } from "~/types";

interface FreshnessBadgeProps {
  bestBefore: Date | null;
  className?: string;
  showDays?: boolean;
}

export function FreshnessBadge({
  bestBefore,
  className,
  showDays = true,
}: FreshnessBadgeProps) {
  const daysUntilExpiry = getDaysUntilExpiry(bestBefore);
  const level = getFreshnessLevel(daysUntilExpiry);
  const info = getFreshnessInfo(level);

  const icons = {
    fresh: Leaf,
    good: Leaf,
    "expiring-soon": Clock,
    expired: XCircle,
  };

  const Icon = icons[level];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        info.bgColor,
        info.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{info.label}</span>
      {showDays && daysUntilExpiry !== null && daysUntilExpiry > 0 && (
        <span className="opacity-75">
          ({daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}

interface FreshnessIndicatorProps {
  bestBefore: Date | null;
  className?: string;
}

export function FreshnessIndicator({
  bestBefore,
  className,
}: FreshnessIndicatorProps) {
  const daysUntilExpiry = getDaysUntilExpiry(bestBefore);
  const level = getFreshnessLevel(daysUntilExpiry);

  const colors = {
    fresh: "bg-green-500",
    good: "bg-emerald-500",
    "expiring-soon": "bg-amber-500",
    expired: "bg-red-500",
  };

  return (
    <div
      className={cn(
        "absolute left-3 top-3 h-2.5 w-2.5 rounded-full ring-2 ring-white",
        colors[level],
        className
      )}
      title={`Freshness: ${getFreshnessInfo(level).label}`}
    />
  );
}
