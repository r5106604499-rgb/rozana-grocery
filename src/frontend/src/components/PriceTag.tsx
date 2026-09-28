import { discountPercent, formatPaise, savingsPaise } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Paise } from "@/types/app";

interface PriceTagProps {
  price: Paise;
  originalPrice?: Paise;
  /** Show the "Save ₹X" line beneath the price. */
  showSavings?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PRICE_SIZE = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
} as const;

const STRIKE_SIZE = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

/** Price with optional strike-through original and savings line. */
export function PriceTag({
  price,
  originalPrice,
  showSavings = false,
  size = "md",
  className,
}: PriceTagProps) {
  const hasDiscount =
    originalPrice !== undefined && originalPrice > price && price >= 0n;
  const saved = hasDiscount ? savingsPaise(originalPrice, price) : 0n;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className={cn("text-price", PRICE_SIZE[size])}>
          {formatPaise(price)}
        </span>
        {hasDiscount ? (
          <span className={cn("text-strike", STRIKE_SIZE[size])}>
            {formatPaise(originalPrice)}
          </span>
        ) : null}
      </div>
      {showSavings && hasDiscount && saved > 0n ? (
        <span className="text-xs font-semibold text-savings">
          Save {formatPaise(saved)}
        </span>
      ) : null}
    </div>
  );
}

interface DiscountBadgeProps {
  originalPrice: Paise;
  price: Paise;
  className?: string;
}

/** Saffron discount ribbon shown on product cards. */
export function DiscountBadge({
  originalPrice,
  price,
  className,
}: DiscountBadgeProps) {
  const percent = discountPercent(originalPrice, price);
  if (percent <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-discount px-1.5 py-0.5 font-display text-[11px] font-bold leading-none text-discount-foreground shadow-subtle",
        className,
      )}
    >
      {percent}% OFF
    </span>
  );
}
