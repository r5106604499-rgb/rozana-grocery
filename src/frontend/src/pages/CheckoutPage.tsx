import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAddresses } from "@/hooks/useAddress";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { formatPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Address, CartItemView, PaymentMethod } from "@/types/app";
import { EMPTY_ADDRESS, PAYMENT_METHOD_LABELS } from "@/types/app";
import { PaymentMethod as PaymentMethodEnum } from "@/types/app";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  Check,
  ChevronLeft,
  CreditCard,
  MapPin,
  PackageOpen,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useMemo, useState } from "react";

interface FieldErrors {
  fullName?: string;
  mobile?: string;
  houseFlat?: string;
  area?: string;
  pincode?: string;
}

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  title: string;
  description: string;
  icon: typeof Banknote;
}[] = [
  {
    value: PaymentMethodEnum.cod,
    title: PAYMENT_METHOD_LABELS[PaymentMethodEnum.cod],
    description: "Pay in cash when your order arrives",
    icon: Banknote,
  },
  {
    value: PaymentMethodEnum.online,
    title: PAYMENT_METHOD_LABELS[PaymentMethodEnum.online],
    description: "Choose online payment at delivery",
    icon: CreditCard,
  },
];

/** Checkout: delivery details, payment choice and order summary. */
export function CheckoutPage() {
  const navigate = useNavigate();
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const placeOrder = usePlaceOrder();

  const [draft, setDraft] = useState<Address>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethodEnum.cod,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cart = cartQuery.data;
  const addresses = addressesQuery.data ?? [];
  const items = cart?.items ?? [];

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + toNumber(item.quantity), 0),
    [items],
  );

  const updateField = (field: keyof Address, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const selectSavedAddress = (id: string, address: Address) => {
    setSelectedAddressId(id);
    setDraft(address);
    setErrors({});
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!draft.fullName.trim()) next.fullName = "Enter the customer name";
    if (!draft.mobile.trim()) {
      next.mobile = "Enter a mobile number";
    } else if (!MOBILE_PATTERN.test(draft.mobile.trim())) {
      next.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!draft.houseFlat.trim()) {
      next.houseFlat = "Enter your house or flat number";
    }
    if (!draft.area.trim()) next.area = "Enter your area or locality";
    if (!draft.pincode.trim()) {
      next.pincode = "Enter a pincode";
    } else if (!PINCODE_PATTERN.test(draft.pincode.trim())) {
      next.pincode = "Enter a valid 6-digit pincode";
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const address: Address = {
      fullName: draft.fullName.trim(),
      mobile: draft.mobile.trim(),
      houseFlat: draft.houseFlat.trim(),
      area: draft.area.trim(),
      landmark: draft.landmark.trim(),
      pincode: draft.pincode.trim(),
      instructions: draft.instructions.trim(),
    };

    placeOrder.mutate(
      { address, paymentMethod },
      {
        onSuccess: (orderId) => {
          void navigate({
            to: "/order-confirmation/$orderId",
            params: { orderId: orderId.toString() },
          });
        },
        onError: () => {
          setSubmitError(
            "We couldn't place your order. Please check your details and try again.",
          );
        },
      },
    );
  };

  if (cartQuery.isLoading) {
    return (
      <Layout title="Checkout" hideNav>
        <LoadingState variant="list" rows={4} />
      </Layout>
    );
  }

  if (cartQuery.isError) {
    return (
      <Layout title="Checkout" hideNav>
        <ErrorState
          title="Couldn't load your cart"
          message="We couldn't fetch your basket. Please try again."
          onRetry={() => void cartQuery.refetch()}
        />
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout title="Checkout" hideNav>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add groceries to your cart before checking out."
          actionLabel="Browse groceries"
          onAction={() => void navigate({ to: "/" })}
        />
      </Layout>
    );
  }

  return (
    <Layout hideHeader hideNav>
      <div data-ocid="checkout_page" className="space-y-5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to cart"
            data-ocid="checkout_back_button"
            onClick={() => void navigate({ to: "/cart" })}
            className="-ml-2 h-9 w-9 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Saved addresses */}
          {addresses.length > 0 ? (
            <section
              data-ocid="checkout_saved_addresses_section"
              aria-labelledby="saved-addresses-heading"
              className="space-y-2.5"
            >
              <h2
                id="saved-addresses-heading"
                className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
              >
                Saved addresses
              </h2>
              <div className="space-y-2">
                {addresses.map((saved) => {
                  const id = saved.id.toString();
                  const selected = selectedAddressId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-ocid="checkout_saved_address_item"
                      aria-pressed={selected}
                      onClick={() => selectSavedAddress(id, saved.address)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-primary",
                        )}
                      >
                        {selected ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">
                          {saved.address.fullName}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {[
                            saved.address.houseFlat,
                            saved.address.area,
                            saved.address.landmark,
                            saved.address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Delivery details */}
          <section
            data-ocid="checkout_address_section"
            aria-labelledby="address-heading"
            className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
          >
            <h2
              id="address-heading"
              className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
            >
              Delivery details
            </h2>

            <Field
              id="checkout-name"
              label="Customer name"
              error={errors.fullName}
            >
              <Input
                id="checkout-name"
                value={draft.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                placeholder="e.g. Ananya Sharma"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                data-ocid="checkout_name_input"
              />
            </Field>

            <Field
              id="checkout-mobile"
              label="Mobile number"
              error={errors.mobile}
            >
              <Input
                id="checkout-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={draft.mobile}
                onChange={(event) =>
                  updateField("mobile", event.target.value.replace(/\D/g, ""))
                }
                placeholder="10-digit mobile number"
                autoComplete="tel"
                aria-invalid={!!errors.mobile}
                data-ocid="checkout_mobile_input"
              />
            </Field>

            <Field
              id="checkout-house"
              label="House / flat number"
              error={errors.houseFlat}
            >
              <Input
                id="checkout-house"
                value={draft.houseFlat}
                onChange={(event) =>
                  updateField("houseFlat", event.target.value)
                }
                placeholder="e.g. Flat 4B, Sunrise Apartments"
                autoComplete="address-line1"
                aria-invalid={!!errors.houseFlat}
                data-ocid="checkout_house_input"
              />
            </Field>

            <Field
              id="checkout-area"
              label="Area / locality"
              error={errors.area}
            >
              <Input
                id="checkout-area"
                value={draft.area}
                onChange={(event) => updateField("area", event.target.value)}
                placeholder="e.g. Indiranagar"
                autoComplete="address-line2"
                aria-invalid={!!errors.area}
                data-ocid="checkout_area_input"
              />
            </Field>

            <Field id="checkout-pincode" label="Pincode" error={errors.pincode}>
              <Input
                id="checkout-pincode"
                inputMode="numeric"
                maxLength={6}
                value={draft.pincode}
                onChange={(event) =>
                  updateField("pincode", event.target.value.replace(/\D/g, ""))
                }
                placeholder="6-digit pincode"
                autoComplete="postal-code"
                aria-invalid={!!errors.pincode}
                data-ocid="checkout_pincode_input"
              />
            </Field>

            <Field id="checkout-landmark" label="Landmark (optional)">
              <Input
                id="checkout-landmark"
                value={draft.landmark}
                onChange={(event) =>
                  updateField("landmark", event.target.value)
                }
                placeholder="e.g. Near Metro Station"
                data-ocid="checkout_landmark_input"
              />
            </Field>

            <Field
              id="checkout-instructions"
              label="Delivery instructions (optional)"
            >
              <Textarea
                id="checkout-instructions"
                value={draft.instructions}
                onChange={(event) =>
                  updateField("instructions", event.target.value)
                }
                placeholder="e.g. Ring the bell twice, leave at the door"
                rows={2}
                data-ocid="checkout_instructions_input"
              />
            </Field>
          </section>

          {/* Payment method */}
          <section
            data-ocid="checkout_payment_section"
            aria-labelledby="payment-heading"
            className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
          >
            <h2
              id="payment-heading"
              className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
            >
              Payment method
            </h2>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              data-ocid="checkout_payment_group"
              className="gap-2"
            >
              {PAYMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = paymentMethod === option.value;
                return (
                  <Label
                    key={option.value}
                    htmlFor={`payment-${option.value}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <RadioGroupItem
                      id={`payment-${option.value}`}
                      value={option.value}
                      data-ocid={`checkout_payment_${option.value}`}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <Icon
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-foreground">
                          {option.title}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>

            <p className="flex items-start gap-2 rounded-md bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
              <ShieldCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              No card details are collected here. Online payment is recorded as
              your preferred method only.
            </p>
          </section>

          {/* Order summary */}
          <section
            data-ocid="checkout_summary_section"
            aria-labelledby="summary-heading"
            className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-subtle"
          >
            <h2
              id="summary-heading"
              className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
            >
              Order summary
            </h2>

            <ul data-ocid="checkout_summary_list" className="space-y-3">
              {items.map((item) => (
                <SummaryLine key={item.productId.toString()} item={item} />
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
              <SummaryRow
                label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
                value={formatPaise(cart?.subtotal ?? 0n)}
              />
              {(cart?.discountTotal ?? 0n) > 0n ? (
                <SummaryRow
                  label="Product savings"
                  value={`− ${formatPaise(cart?.discountTotal ?? 0n)}`}
                  tone="savings"
                />
              ) : null}
              {(cart?.couponDiscount ?? 0n) > 0n ? (
                <SummaryRow
                  label={`Coupon${cart?.couponCode ? ` (${cart.couponCode})` : ""}`}
                  value={`− ${formatPaise(cart?.couponDiscount ?? 0n)}`}
                  tone="savings"
                />
              ) : null}
              <SummaryRow
                label="Delivery charge"
                value={
                  (cart?.deliveryCharge ?? 0n) === 0n
                    ? "FREE"
                    : formatPaise(cart?.deliveryCharge ?? 0n)
                }
                tone={
                  (cart?.deliveryCharge ?? 0n) === 0n ? "savings" : "default"
                }
              />
              <div className="flex items-center justify-between border-t border-border pt-2">
                <dt className="font-display text-base font-bold text-foreground">
                  Total
                </dt>
                <dd data-ocid="checkout_total" className="text-price text-lg">
                  {formatPaise(cart?.total ?? 0n)}
                </dd>
              </div>
            </dl>
          </section>

          {submitError ? (
            <p
              data-ocid="checkout_submit_error"
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={placeOrder.isPending}
            data-ocid="checkout_place_order_button"
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            {placeOrder.isPending
              ? "Placing order…"
              : `Place order · ${formatPaise(cart?.total ?? 0n)}`}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By placing this order you agree to our delivery terms.
          </p>
        </form>
      </div>
    </Layout>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

/** Labelled form field with an inline validation message. */
function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          data-ocid={`${id}_error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface SummaryLineProps {
  item: CartItemView;
}

/** One product row inside the checkout summary. */
function SummaryLine({ item }: SummaryLineProps) {
  const quantity = toNumber(item.quantity);
  return (
    <li data-ocid="checkout_summary_item" className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-well">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
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
          {item.name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {item.brand} · {item.packSize} · Qty {quantity}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {formatPaise(item.lineTotal)}
      </span>
    </li>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  tone?: "default" | "savings";
}

/** A label/value row in the totals block. */
function SummaryRow({ label, value, tone = "default" }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-medium tabular-nums",
          tone === "savings" ? "text-savings" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
