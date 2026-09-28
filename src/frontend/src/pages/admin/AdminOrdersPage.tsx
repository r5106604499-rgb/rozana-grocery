import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminOrders, useAdminSetOrderStatus } from "@/hooks/useAdmin";
import { formatDateTime, formatPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  OrderStatus,
  PAYMENT_METHOD_LABELS,
} from "@/types/app";
import type { Order } from "@/types/app";
import type { Principal } from "@icp-sdk/core/principal";
import { ChevronRight, ShoppingBag } from "lucide-react";

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  [OrderStatus.placed]: "bg-secondary text-secondary-foreground",
  [OrderStatus.confirmed]: "bg-primary/15 text-primary",
  [OrderStatus.packing]: "bg-warning/20 text-warning-foreground",
  [OrderStatus.outForDelivery]: "bg-accent/20 text-accent-foreground",
  [OrderStatus.delivered]: "bg-success/15 text-savings",
};

function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  if (index < 0 || index >= ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}

interface OrderRowProps {
  customer: Principal;
  order: Order;
  index: number;
  onStatusChange: (
    customer: Principal,
    orderId: bigint,
    status: OrderStatus,
  ) => void;
  isPending: boolean;
}

function OrderRow({
  customer,
  order,
  index,
  onStatusChange,
  isPending,
}: OrderRowProps) {
  const next = nextStatus(order.status);
  const itemCount = order.lines.reduce(
    (total, line) => total + toNumber(line.quantity),
    0,
  );

  return (
    <article
      data-ocid={`admin_order_item.${index + 1}`}
      className="space-y-3 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">
            Order #{order.id.toString()}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {order.address.fullName} · {order.address.mobile}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {[order.address.area, order.address.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        <Badge
          className={cn(
            "shrink-0 border-transparent",
            STATUS_BADGE_CLASSES[order.status],
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <ul className="space-y-1 border-y border-border py-2">
        {order.lines.map((line, lineIndex) => (
          <li
            key={`${order.id.toString()}-${lineIndex}`}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="min-w-0 truncate text-foreground">
              {line.name}
              <span className="text-muted-foreground">
                {" "}
                × {toNumber(line.quantity)}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatPaise(line.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        </span>
        <span>{formatDateTime(order.placedAt)}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-base font-bold tabular-nums text-foreground">
          {formatPaise(order.total)}
        </span>
        <div className="flex items-center gap-2">
          {next ? (
            <Button
              type="button"
              size="sm"
              data-ocid={`admin_advance_order_button.${index + 1}`}
              disabled={isPending}
              onClick={() => onStatusChange(customer, order.id, next)}
              className="gap-1 rounded-full"
            >
              Mark {ORDER_STATUS_LABELS[next].toLowerCase()}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          ) : null}
          <Select
            value={order.status}
            onValueChange={(value) =>
              onStatusChange(customer, order.id, value as OrderStatus)
            }
          >
            <SelectTrigger
              size="sm"
              aria-label={`Change status for order ${order.id.toString()}`}
              data-ocid={`admin_order_status_select.${index + 1}`}
              className="w-[130px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_FLOW.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </article>
  );
}

function OrdersContent() {
  const ordersQuery = useAdminOrders();
  const setStatus = useAdminSetOrderStatus();
  const orders = ordersQuery.data ?? [];

  return (
    <AdminQueryState
      isLoading={ordersQuery.isLoading}
      isError={ordersQuery.isError}
      onRetry={() => void ordersQuery.refetch()}
    >
      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          message="Customer orders will appear here as soon as they are placed."
        />
      ) : (
        <div className="space-y-3">
          {orders.map(([customer, order], index) => (
            <OrderRow
              key={`${customer.toText()}-${order.id.toString()}`}
              customer={customer}
              order={order}
              index={index}
              isPending={setStatus.isPending}
              onStatusChange={(targetCustomer, orderId, status) =>
                setStatus.mutate({
                  customer: targetCustomer,
                  orderId,
                  status,
                })
              }
            />
          ))}
        </div>
      )}
    </AdminQueryState>
  );
}

export function AdminOrdersPage() {
  return (
    <Layout title="Manage orders">
      <AdminGuard>
        <OrdersContent />
      </AdminGuard>
    </Layout>
  );
}
