import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { OrderStatusBadge } from "@/components/OrderStatus";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrders } from "@/hooks/useOrders";
import { formatDateTime, formatPaise, pluralize, toNumber } from "@/lib/format";
import { type Order, PAYMENT_METHOD_LABELS } from "@/types/app";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogIn, ShoppingBag } from "lucide-react";

/** One order summary row linking to its detail page. */
function OrderRow({ order }: { order: Order }) {
  const itemCount = order.lines.reduce(
    (sum, line) => sum + toNumber(line.quantity),
    0,
  );

  return (
    <Link
      to="/orders/$orderId"
      params={{ orderId: order.id.toString() }}
      data-ocid="order_item"
      className="block rounded-xl border border-border bg-card p-3 shadow-subtle transition-smooth hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-muted-foreground">
            #{order.id.toString()}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
            {pluralize(itemCount, "item")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDateTime(order.placedAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
          <p className="text-price text-base">{formatPaise(order.total)}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          View details
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const ordersQuery = useMyOrders(isAuthenticated);

  if (isInitializing) {
    return (
      <Layout title="Your orders">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout title="Your orders">
        <EmptyState
          icon={LogIn}
          title="Sign in to see your orders"
          message="Log in with Internet Identity to track your deliveries and reorder your favourites."
        >
          <Button
            type="button"
            data-ocid="orders_login_button"
            disabled={isLoggingIn}
            onClick={() => void login()}
            className="mt-1 gap-2 rounded-full"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {isLoggingIn ? "Signing in…" : "Sign in"}
          </Button>
        </EmptyState>
      </Layout>
    );
  }

  if (ordersQuery.isLoading) {
    return (
      <Layout title="Your orders">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (ordersQuery.isError) {
    return (
      <Layout title="Your orders">
        <ErrorState
          title="Couldn't load your orders"
          message="We couldn't fetch your order history. Please try again."
          onRetry={() => void ordersQuery.refetch()}
        />
      </Layout>
    );
  }

  const orders = ordersQuery.data ?? [];

  if (orders.length === 0) {
    return (
      <Layout title="Your orders">
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          message="Your past orders will appear here once you place one."
          actionLabel="Start shopping"
          onAction={() => void navigate({ to: "/" })}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Your orders">
      <div data-ocid="orders_list" className="space-y-3">
        {orders.map((order) => (
          <OrderRow key={order.id.toString()} order={order} />
        ))}
      </div>
    </Layout>
  );
}
