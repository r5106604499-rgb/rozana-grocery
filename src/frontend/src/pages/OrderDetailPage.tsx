import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { OrderStatusBadge, OrderStatusTracker } from "@/components/OrderStatus";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrder } from "@/hooks/useOrders";
import { formatDateTime, formatPaise, pluralize, toNumber } from "@/lib/format";
import {
  type Address,
  type Order,
  type OrderLine,
  PAYMENT_METHOD_LABELS,
} from "@/types/app";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, LogIn, MapPin, PackageX, Receipt } from "lucide-react";

/** Parse the route's string order id into a bigint, or undefined when invalid. */
function parseOrderId(raw: string | undefined): bigint | undefined {
  if (!raw) return undefined;
  try {
    const value = BigInt(raw);
    return value >= 0n ? value : undefined;
  } catch {
    return undefined;
  }
}

/** One ordered product with image, quantity and line total. */
function OrderLineRow({ line }: { line: OrderLine }) {
  const quantity = toNumber(line.quantity);

  return (
    <li
      data-ocid="order_line_item"
      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-well">
        {line.imageUrl ? (
          <img
            src={line.imageUrl}
            alt={line.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-muted-foreground">
            {line.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {line.brand}
        </p>
        <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
          {line.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {line.packSize} · {formatPaise(line.unitPrice)} × {quantity}
        </p>
      </div>
      <span className="shrink-0 font-display text-sm font-bold tabular-nums text-foreground">
        {formatPaise(line.lineTotal)}
      </span>
    </li>
  );
}

/** Delivery address block. */
function AddressBlock({ address }: { address: Address }) {
  const lines = [
    address.houseFlat,
    address.area,
    address.landmark,
    `${address.pincode}`,
  ].filter((part) => part.trim().length > 0);

  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <MapPin className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-foreground">{address.fullName}</p>
        <p className="mt-0.5 text-muted-foreground">{lines.join(", ")}</p>
        <p className="mt-0.5 text-muted-foreground">{address.mobile}</p>
        {address.instructions ? (
          <p className="mt-1 text-xs italic text-muted-foreground">
            “{address.instructions}”
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Price breakdown rows for the order. */
function PriceBreakdown({ order }: { order: Order }) {
  const rows: Array<{ label: string; value: string; accent?: boolean }> = [
    { label: "Subtotal", value: formatPaise(order.subtotal) },
  ];

  if (order.discountTotal > 0n) {
    rows.push({
      label: "Product savings",
      value: `− ${formatPaise(order.discountTotal)}`,
      accent: true,
    });
  }
  if (order.couponDiscount > 0n) {
    rows.push({
      label: order.couponCode ? `Coupon (${order.couponCode})` : "Coupon",
      value: `− ${formatPaise(order.couponDiscount)}`,
      accent: true,
    });
  }
  rows.push({
    label: "Delivery",
    value:
      order.deliveryCharge > 0n ? formatPaise(order.deliveryCharge) : "FREE",
  });

  return (
    <dl className="space-y-2 text-sm">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd
            className={
              row.accent
                ? "font-semibold text-savings"
                : "font-medium text-foreground"
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
        <dt className="font-display text-base font-bold text-foreground">
          Total paid
        </dt>
        <dd className="text-price text-lg">{formatPaise(order.total)}</dd>
      </div>
    </dl>
  );
}

export function OrderDetailPage() {
  const { orderId: rawOrderId } = useParams({ strict: false });
  const orderId = parseOrderId(rawOrderId);
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const orderQuery = useMyOrder(orderId, isAuthenticated);

  const goBack = () => {
    void navigate({ to: "/orders" });
  };

  const header = (
    <div className="mb-3 flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Back to orders"
        data-ocid="back_button"
        onClick={goBack}
        className="h-9 w-9 rounded-full"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
      <h1 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-foreground">
        Order details
      </h1>
    </div>
  );

  if (isInitializing) {
    return (
      <Layout>
        {header}
        <LoadingState variant="detail" />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        {header}
        <EmptyState
          icon={LogIn}
          title="Sign in to view this order"
          message="Log in with Internet Identity to see your order details and delivery status."
        >
          <Button
            type="button"
            data-ocid="order_login_button"
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

  if (orderId === undefined) {
    return (
      <Layout>
        {header}
        <EmptyState
          icon={PackageX}
          title="Order not found"
          message="This order link looks broken. Head back to your orders to find it."
          actionLabel="Back to orders"
          onAction={goBack}
        />
      </Layout>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <Layout>
        {header}
        <LoadingState variant="detail" />
      </Layout>
    );
  }

  if (orderQuery.isError) {
    return (
      <Layout>
        {header}
        <ErrorState
          title="Couldn't load this order"
          message="We couldn't fetch the order details. Please try again."
          onRetry={() => void orderQuery.refetch()}
        />
      </Layout>
    );
  }

  const order = orderQuery.data;

  if (!order) {
    return (
      <Layout>
        {header}
        <EmptyState
          icon={PackageX}
          title="Order not found"
          message="We couldn't find this order. It may belong to a different account."
          actionLabel="Back to orders"
          onAction={goBack}
        />
      </Layout>
    );
  }

  const itemCount = order.lines.reduce(
    (sum, line) => sum + toNumber(line.quantity),
    0,
  );

  return (
    <Layout>
      {header}

      <article data-ocid="order_detail" className="space-y-4 pb-6">
        <section className="rounded-xl border border-border bg-card p-4 shadow-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Order ID
              </p>
              <p className="font-mono text-base font-bold text-foreground">
                #{order.id.toString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Placed {formatDateTime(order.placedAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </section>

        <section
          aria-labelledby="tracker-heading"
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="tracker-heading"
            className="mb-3 font-display text-sm font-semibold text-foreground"
          >
            Order status
          </h2>
          <OrderStatusTracker status={order.status} />
        </section>

        <section
          aria-labelledby="items-heading"
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="items-heading"
            className="mb-1 font-display text-sm font-semibold text-foreground"
          >
            {pluralize(itemCount, "item")} in this order
          </h2>
          <ul className="divide-y divide-border">
            {order.lines.map((line) => (
              <OrderLineRow
                key={`${line.productId.toString()}-${line.packSize}`}
                line={line}
              />
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="payment-heading"
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="payment-heading"
            className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground"
          >
            <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
            Payment summary
          </h2>
          <PriceBreakdown order={order} />
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Paid via{" "}
            <span className="font-semibold text-foreground">
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </span>
          </p>
        </section>

        <section
          aria-labelledby="address-heading"
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="address-heading"
            className="mb-3 font-display text-sm font-semibold text-foreground"
          >
            Delivery address
          </h2>
          <AddressBlock address={order.address} />
        </section>
      </article>
    </Layout>
  );
}
