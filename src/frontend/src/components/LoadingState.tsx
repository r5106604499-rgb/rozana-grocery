import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton rows to render. */
  rows?: number;
  /** Render a product-grid shaped skeleton instead of list rows. */
  variant?: "list" | "grid" | "detail";
  className?: string;
}

const SKELETON_IDS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

/** Layout-matched skeleton used while data loads. */
export function LoadingState({
  rows = 4,
  variant = "list",
  className,
}: LoadingStateProps) {
  if (variant === "grid") {
    return (
      <div
        data-ocid="loading_state"
        aria-busy="true"
        aria-label="Loading products"
        className={cn("grid grid-cols-2 gap-3", className)}
      >
        {SKELETON_IDS.slice(0, rows).map((id) => (
          <div
            key={id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div
        data-ocid="loading_state"
        aria-busy="true"
        aria-label="Loading details"
        className={cn("space-y-4", className)}
      >
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div
      data-ocid="loading_state"
      aria-busy="true"
      aria-label="Loading"
      className={cn("space-y-3", className)}
    >
      {SKELETON_IDS.slice(0, rows).map((id) => (
        <div
          key={id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
