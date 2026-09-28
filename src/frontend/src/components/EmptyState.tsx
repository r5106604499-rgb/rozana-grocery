import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

/** Friendly empty surface with a clear next step. */
export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  message,
  actionLabel,
  onAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <Button
          type="button"
          data-ocid="empty_state_action_button"
          onClick={onAction}
          className="mt-1"
        >
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
