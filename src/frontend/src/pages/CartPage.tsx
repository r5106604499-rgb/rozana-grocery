import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useApplyCoupon,
  useCart,
  useRemoveCoupon,
  useRemoveFromCart,
  useSetCartQuantity,
} from "@/hooks/useCart";
import { formatPaise, pluralize, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartError, CartItemView } from "@/types/app";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgePercent,
  Check,
  ChevronRight,
  ShoppingBasket,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";

/** Map every coupon error variant to a clear, actionable message. */
function couponErrorMessage(error: CartError): string {
  switch (error.__kind__) {
    case "couponNotFound":
      return `We couldn't find the code "${error.couponNotFound}". Check the spelling and try again.`;
    case "couponInactive":
      return `The code "${error.couponInactive}" is no longer active. Try another offer.`;
    case "couponMinOrderNotMet":
      return `Add ${formatPaise(
        error.couponMinOrderNotMet.required - error.couponMinOrderNotMet.actual,
      )} more to use this coupon. Minimum order is ${formatPaise(
        error.couponMinOrderNotMet.required,
      )}.`;
    case "emptyCart":
      return "Add items to your cart before applying a coupon.";
    case "invalidQuantity":
      return "That quantity isn't available. Please try again.";
    case "outOfStock":
      return "One of your items just went out of stock. Please review your cart.";
    case "productNotFound":
      return "One of your items is no longer available. Please review your cart.";
    default:
      return "We couldn't apply that coupon. Please try again.";
  }
}

/** A single cart line: image, details, quantity stepper and remove action. */
function CartLine({
  item,
  index,
  onQuantityChange,
  onRemove,
  busy,
}: {
  item: CartItemView;
  index: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  busy: boolean;
}) {
  const quantity = toNumber(item.quantity);
  const hasDiscount = item.originalUnitPrice > item.unitPrice;

  return (
    <li
      data-ocid={`cart.item.${index + 1}`}
      className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-subtle"
    >
      <Link
        to="/products/$productId"
        params={{ productId: item.productId.toString() }}
        className="shrink-0"
        aria-label={`View ${item.name}`}
      >
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md bg-well">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.brand}
            </p>
            <Link
              to="/products/$productId"
              params={{ productId: item.productId.toString() }}
              className="block truncate font-display text-sm font-semibold text-foreground hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground">{item.packSize}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${item.name} from cart`}
            data-ocid={`cart.remove_button.${index + 1}`}
            disabled={busy}
            onClick={onRemove}
            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {!item.inStock ? (
          <p className="text-xs font-semibold text-stock-out-foreground">
            Out of stock — remove to continue
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {formatPaise(item.unitPrice)} each
            </span>
            <span className="text-price text-base">
              {formatPaise(item.lineTotal)}
            </span>
            {hasDiscount ? (
              <span className="text-strike text-xs">
                {formatPaise(item.originalUnitPrice * item.quantity)}
              </span>
            ) : null}
          </div>
          <QuantityStepper
            quantity={quantity}
            size="sm"
            disabled={busy}
            onIncrement={() => onQuantityChange(quantity + 1)}
            onDecrement={() => onQuantityChange(quantity - 1)}
          />
        </div>
      </div>
    </li>
  );
}

/** One row in the price summary. */
function SummaryRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "savings" | "muted";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "savings" && "font-semibold text-savings",
          tone === "muted" && "text-muted-foreground",
          tone === "default" && "font-medium text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const setQuantity = useSetCartQuantity();
  const removeItem = useRemoveFromCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const [code, setCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const items = cart?.items ?? [];
  const itemCount = cart ? toNumber(cart.itemCount) : 0;
  const subtotal = cart?.subtotal ?? 0n;
  const discountTotal = cart?.discountTotal ?? 0n;
  const deliveryCharge = cart?.deliveryCharge ?? 0n;
  const couponDiscount = cart?.couponDiscount ?? 0n;
  const total = cart?.total ?? 0n;
  const threshold = cart?.freeDeliveryThreshold ?? 0n;
  const appliedCode = cart?.couponCode;

  const remainingForFreeDelivery =
    threshold > subtotal ? threshold - subtotal : 0n;
  const freeDeliveryProgress =
    threshold > 0n
      ? Math.min(100, Math.round((Number(subtotal) / Number(threshold)) * 100))
      : 100;

  const lineBusy =
    setQuantity.isPending || removeItem.isPending || applyCoupon.isPending;

  function handleQuantityChange(productId: bigint, quantity: number) {
    if (quantity < 1) {
      removeItem.mutate(productId);
      return;
    }
    setQuantity.mutate({ productId, quantity: BigInt(quantity) });
  }

  function handleApplyCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setCouponFeedback(null);
    applyCoupon.mutate(trimmed, {
      onSuccess: (result) => {
        if (result.__kind__ === "invalidQuantity") {
          setCouponFeedback({
            kind: "success",
            message: `Coupon "${trimmed.toUpperCase()}" applied.`,
          });
          setCode("");
          return;
        }
        setCouponFeedback({
          kind: "error",
          message: couponErrorMessage(result),
        });
      },
      onError: () => {
        setCouponFeedback({
          kind: "error",
          message: "We couldn't apply that coupon. Please try again.",
        });
      },
    });
  }

  function handleRemoveCoupon() {
    setCouponFeedback(null);
    removeCoupon.mutate(undefined, {
      onSuccess: () => {
        setCouponFeedback({
          kind: "success",
          message: "Coupon removed.",
        });
      },
      onError: () => {
        setCouponFeedback({
          kind: "error",
          message: "We couldn't remove the coupon. Please try again.",
        });
      },
    });
  }

  if (isLoading) {
    return (
      <Layout title="Your cart">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout title="Your cart">
        <ErrorState
          title="We couldn't load your cart"
          message="Please check your connection and try again."
          onRetry={() => void refetch()}
        />
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout title="Your cart">
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          message="Add daily essentials and they'll show up here, ready for a 30-minute delivery."
        >
          <Button
            type="button"
            data-ocid="cart.start_shopping_button"
            onClick={() => void navigate({ to: "/" })}
            className="mt-1 gap-2 rounded-full px-6"
          >
            Start shopping
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </EmptyState>
      </Layout>
    );
  }

  return (
    <Layout title="Your cart">
      <div className="space-y-4 pb-40">
        <p className="text-sm text-muted-foreground">
          {pluralize(itemCount, "item")} in your cart
        </p>

        <ul data-ocid="cart.list" className="space-y-3">
          {items.map((item, index) => (
            <CartLine
              key={item.productId.toString()}
              item={item}
              index={index}
              busy={lineBusy}
              onQuantityChange={(quantity) =>
                handleQuantityChange(item.productId, quantity)
              }
              onRemove={() => removeItem.mutate(item.productId)}
            />
          ))}
        </ul>

        {/* Coupon */}
        <section
          data-ocid="cart.coupon_panel"
          className="rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
            <Tag className="h-4 w-4 text-primary" aria-hidden="true" />
            Coupons &amp; offers
          </h2>

          {appliedCode ? (
            <div
              data-ocid="cart.coupon_applied"
              className="flex items-center justify-between gap-3 rounded-md border border-savings/40 bg-savings/10 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <BadgePercent
                  className="h-4 w-4 shrink-0 text-savings"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-savings">
                    {appliedCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You saved {formatPaise(couponDiscount)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid="cart.remove_coupon_button"
                disabled={removeCoupon.isPending}
                onClick={handleRemoveCoupon}
                className="shrink-0 gap-1 rounded-full text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </Button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <label htmlFor="coupon-code" className="sr-only">
                Coupon code
              </label>
              <Input
                id="coupon-code"
                data-ocid="cart.coupon_input"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Enter coupon code"
                autoComplete="off"
                autoCapitalize="characters"
                className="h-10 flex-1 uppercase"
              />
              <Button
                type="submit"
                data-ocid="cart.apply_coupon_button"
                disabled={applyCoupon.isPending || code.trim().length === 0}
                className="h-10 shrink-0 rounded-full px-5"
              >
                {applyCoupon.isPending ? "Applying…" : "Apply"}
              </Button>
            </form>
          )}

          {couponFeedback ? (
            <p
              data-ocid={
                couponFeedback.kind === "success"
                  ? "cart.coupon_success"
                  : "cart.coupon_error"
              }
              role={couponFeedback.kind === "error" ? "alert" : "status"}
              className={cn(
                "mt-2.5 flex items-start gap-1.5 text-xs font-medium",
                couponFeedback.kind === "success"
                  ? "text-savings"
                  : "text-destructive",
              )}
            >
              {couponFeedback.kind === "success" ? (
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {couponFeedback.message}
            </p>
          ) : null}
        </section>

        {/* Price summary */}
        <section
          data-ocid="cart.summary_panel"
          className="rounded-lg border border-border bg-card p-4 shadow-subtle"
        >
          <h2 className="mb-3 font-display text-sm font-semibold text-foreground">
            Price details
          </h2>
          <div className="space-y-2.5">
            <SummaryRow
              label={`Subtotal (${pluralize(itemCount, "item")})`}
              value={formatPaise(subtotal)}
            />
            {discountTotal > 0n ? (
              <SummaryRow
                label="Product discount"
                value={`− ${formatPaise(discountTotal)}`}
                tone="savings"
              />
            ) : null}
            {couponDiscount > 0n ? (
              <SummaryRow
                label={`Coupon${appliedCode ? ` (${appliedCode})` : ""}`}
                value={`− ${formatPaise(couponDiscount)}`}
                tone="savings"
              />
            ) : null}
            <SummaryRow
              label="Delivery charge"
              value={
                deliveryCharge === 0n ? "FREE" : formatPaise(deliveryCharge)
              }
              tone={deliveryCharge === 0n ? "savings" : "default"}
            />
            <div className="border-t border-dashed border-border pt-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-base font-bold text-foreground">
                  Total
                </span>
                <span className="text-price text-lg">{formatPaise(total)}</span>
              </div>
            </div>
          </div>

          {discountTotal + couponDiscount > 0n ? (
            <p className="mt-3 rounded-md bg-savings/10 px-3 py-2 text-xs font-semibold text-savings">
              You save {formatPaise(discountTotal + couponDiscount)} on this
              order
            </p>
          ) : null}
        </section>
      </div>

      {/* Sticky summary bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-border bg-card px-4 pb-24 pt-3 shadow-nav-top">
        {remainingForFreeDelivery > 0n ? (
          <div data-ocid="cart.free_delivery_hint" className="mb-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Truck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Add {formatPaise(remainingForFreeDelivery)} more for free delivery
            </p>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              tabIndex={0}
              aria-valuenow={freeDeliveryProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress towards free delivery"
            >
              <div
                className="h-full rounded-full bg-gradient-primary transition-smooth"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <p
            data-ocid="cart.free_delivery_hint"
            className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-savings"
          >
            <Truck className="h-3.5 w-3.5" aria-hidden="true" />
            You&apos;ve unlocked free delivery
          </p>
        )}

        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total
            </span>
            <span className="text-price text-lg">{formatPaise(total)}</span>
          </div>
          <Button
            type="button"
            data-ocid="cart.checkout_button"
            onClick={() => void navigate({ to: "/checkout" })}
            className="h-11 flex-1 gap-2 rounded-full text-base font-semibold"
          >
            Proceed to Checkout
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
