import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Compact quantity control used on cart lines and product cards. */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
  className,
}: QuantityStepperProps) {
  const atMin = quantity <= min;
  const atMax = quantity >= max;
  const buttonSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      data-ocid="quantity_stepper"
      className={cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/5",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Decrease quantity"
        data-ocid="quantity_decrement_button"
        disabled={disabled || atMin}
        onClick={onDecrement}
        className={cn(
          buttonSize,
          "rounded-full text-primary hover:bg-primary/10 disabled:opacity-40",
        )}
      >
        <Minus className={iconSize} aria-hidden="true" />
      </Button>
      <span
        aria-live="polite"
        className={cn(
          "min-w-7 text-center font-display font-bold tabular-nums text-foreground",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Increase quantity"
        data-ocid="quantity_increment_button"
        disabled={disabled || atMax}
        onClick={onIncrement}
        className={cn(
          buttonSize,
          "rounded-full text-primary hover:bg-primary/10 disabled:opacity-40",
        )}
      >
        <Plus className={iconSize} aria-hidden="true" />
      </Button>
    </div>
  );
}
