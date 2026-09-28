import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useMyOrder } from "@/hooks/useOrders";
import { formatDateTime, formatPaise, toNumber } from "@/lib/format";
import type { Order, OrderLine } from "@/types/app";
import { PAYMENT_METHOD_LABELS } from "@/types/app";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  PackageOpen,
  Receipt,
  Truck,
  Wallet,
} from "lucide-react";

/** Order confirmation: success state with order id, items and totals. */
export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderId } = useParams({ from: "/order-confirmation/$orderId" });

  const parsedId = (() => {
    try {
      return BigInt(orderId);
    } catch {
      return undefined;
    }
  })();

  const orderQuery = useMyOrder(parsedId);
  const order = orderQuery.data;

  if (parsedId === undefined) {
    return (
      <Layout title="Order placed" hideNav>
        <ErrorState
          title="Order not found"
          message="We couldn't find this order. It may have been removed."
        />
      </Layout>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <Layout title="Order placed" hideNav>
        <LoadingState variant="detail" />
      </Layout>
    );
  }

  if (orderQuery.isError) {
    return (
      <Layout title="Order placed" hideNav>
        <ErrorState
          title="Couldn't load your order"
          message="We couldn't fetch this order. Please try again."
          onRetry={() => void orderQuery.refetch()}
        />
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Order placed" hideNav>
        <ErrorState
          title="Order not found"
          message="We couldn't find this order. It may have been removed."
        />
      </Layout>
    );
  }

  const itemCount = order.lines.reduce(
    (sum, line) => sum + toNumber(line.quantity),
    0,
  );

  return (
    <Layout hideHeader hideNav>
      <div data-ocid="order_confirmation_page" className="space-y-5">
        {/* Success banner */}
        <section
          data-ocid="order_confirmation_success_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-5 py-7 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-elevated">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Order placed successfully
            </h1>
            <p className="text-sm text-muted-foreground">
              Thank you! Your groceries are being packed.
            </p>
          </div>
          <span
            data-ocid="order_confirmation_status"
            className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-bold uppercase tracking-wide text-success-foreground"
          >
            <Truck className="h-3.5 w-3.5" aria-hidden="true" />
            Order Placed
          </span>
        </section>

        {/* Order meta */}
        <section
          data-ocid="order_confirmation_meta_section"
          className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
              Order ID
            </span>
            <span
              data-ocid="order_confirmation_order_id"
              className="font-mono text-sm font-semibold text-foreground"
            >
              #{order.id.toString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Placed on</span>
            <span className="text-sm font-medium text-foreground">
              {formatDateTime(order.placedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
              Payment method
            </span>
            <span
              data-ocid="order_confirmation_payment_method"
              className="text-sm font-medium text-foreground"
            >
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </span>
          </div>
        </section>

        {/* Delivery address */}
        <section
          data-ocid="order_confirmation_address_section"
          aria-labelledby="confirmation-address-heading"
          className="space-y-2 rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="confirmation-address-heading"
            className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
          >
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Delivery address
          </h2>
          <p className="text-sm font-semibold text-foreground">
            {order.address.fullName}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {[
              order.address.houseFlat,
              order.address.area,
              order.address.landmark,
              order.address.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">
            Mobile: {order.address.mobile}
          </p>
          {order.address.instructions ? (
            <p className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
              {order.address.instructions}
            </p>
          ) : null}
        </section>

        {/* Ordered products */}
        <section
          data-ocid="order_confirmation_items_section"
          aria-labelledby="confirmation-items-heading"
          className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="confirmation-items-heading"
            className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
          >
            Ordered products ({itemCount})
          </h2>
          <ul data-ocid="order_confirmation_items_list" className="space-y-3">
            {order.lines.map((line) => (
              <OrderLineRow key={line.productId.toString()} line={line} />
            ))}
          </ul>
        </section>

        {/* Totals */}
        <section
          data-ocid="order_confirmation_totals_section"
          aria-labelledby="confirmation-totals-heading"
          className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <h2
            id="confirmation-totals-heading"
            className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
          >
            Bill details
          </h2>
          <dl className="space-y-1.5 text-sm">
            <TotalRow label="Subtotal" value={formatPaise(order.subtotal)} />
            {order.discountTotal > 0n ? (
              <TotalRow
                label="Product savings"
                value={`− ${formatPaise(order.discountTotal)}`}
                tone="savings"
              />
            ) : null}
            {order.couponDiscount > 0n ? (
              <TotalRow
                label={`Coupon${order.couponCode ? ` (${order.couponCode})` : ""}`}
                value={`− ${formatPaise(order.couponDiscount)}`}
                tone="savings"
              />
            ) : null}
            <TotalRow
              label="Delivery charge"
              value={
                order.deliveryCharge === 0n
                  ? "FREE"
                  : formatPaise(order.deliveryCharge)
              }
              tone={order.deliveryCharge === 0n ? "savings" : "default"}
            />
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="font-display text-base font-bold text-foreground">
                Total amount
              </dt>
              <dd
                data-ocid="order_confirmation_total"
                className="text-price text-lg"
              >
                {formatPaise(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Actions */}
        <div className="space-y-2.5">
          <Button
            type="button"
            size="lg"
            data-ocid="order_confirmation_track_button"
            onClick={() =>
              void navigate({
                to: "/orders/$orderId",
                params: { orderId: order.id.toString() },
              })
            }
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            <Truck className="h-4 w-4" aria-hidden="true" />
            Track this order
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            <Link to="/" data-ocid="order_confirmation_continue_link">
              Continue shopping
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}

interface OrderLineRowProps {
  line: OrderLine;
}

/** One ordered product row. */
function OrderLineRow({ line }: OrderLineRowProps) {
  const quantity = toNumber(line.quantity);
  return (
    <li data-ocid="order_confirmation_item" className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-well">
        {line.imageUrl ? (
          <img
            src={line.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <PackageOpen
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {line.name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {line.brand} · {line.packSize} · Qty {quantity}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {formatPaise(line.lineTotal)}
      </span>
    </li>
  );
}

interface TotalRowProps {
  label: string;
  value: string;
  tone?: "default" | "savings";
}

/** A label/value row in the bill details block. */
function TotalRow({ label, value, tone = "default" }: TotalRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          tone === "savings"
            ? "font-medium tabular-nums text-savings"
            : "font-medium tabular-nums text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
