import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/types/app";
import { Check } from "lucide-react";

/** Status badge colour per pipeline stage. */
const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  placed: "bg-muted text-muted-foreground",
  confirmed: "bg-secondary text-secondary-foreground",
  packing: "bg-warning/15 text-warning",
  outForDelivery: "bg-accent/20 text-accent-foreground",
  delivered: "bg-savings/15 text-savings",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/** Compact pill showing the current order status. */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      data-ocid="order_status_badge"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide",
        STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

interface OrderStatusTrackerProps {
  status: OrderStatus;
  className?: string;
}

/** Five-step vertical tracker with the current stage highlighted. */
export function OrderStatusTracker({
  status,
  className,
}: OrderStatusTrackerProps) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol
      data-ocid="order_status_tracker"
      className={cn("space-y-0", className)}
      aria-label="Order progress"
    >
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ORDER_STATUS_FLOW.length - 1;

        return (
          <li
            key={step}
            data-ocid={`order_status_step.${index + 1}`}
            aria-current={isCurrent ? "step" : undefined}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-smooth",
                  isComplete &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-card text-primary",
                  !isComplete &&
                    !isCurrent &&
                    "border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isCurrent ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "my-0.5 w-0.5 flex-1 rounded-full",
                    isComplete ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p
                className={cn(
                  "font-display text-sm font-semibold leading-7",
                  isCurrent
                    ? "text-foreground"
                    : isComplete
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {ORDER_STATUS_LABELS[step]}
              </p>
              {isCurrent ? (
                <p className="text-xs text-muted-foreground">
                  {step === "delivered"
                    ? "Delivered to your address"
                    : "Current status"}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
