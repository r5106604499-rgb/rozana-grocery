import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { DiscountBadge, PriceTag } from "@/components/PriceTag";
import { ProductCard } from "@/components/ProductCard";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart, useCart, useSetCartQuantity } from "@/hooks/useCart";
import { useProduct, useProductsByCategory } from "@/hooks/useProducts";
import { useRecordRecentlyViewed } from "@/hooks/useProducts";
import { useIsWishlisted, useToggleWishlist } from "@/hooks/useWishlist";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { formatPaise, savingsPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/app";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  Heart,
  PackageX,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useMemo } from "react";

/** Parse the route's string product id into a bigint, or undefined when invalid. */
function parseProductId(raw: string | undefined): bigint | undefined {
  if (!raw) return undefined;
  try {
    const value = BigInt(raw);
    return value >= 0n ? value : undefined;
  } catch {
    return undefined;
  }
}

type StockState = "in" | "low" | "out";

function stockState(product: Product): StockState {
  if (!product.inStock || product.stockQuantity <= 0n) return "out";
  if (product.stockQuantity <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

const STOCK_COPY: Record<StockState, { label: string; className: string }> = {
  in: {
    label: "In stock",
    className: "bg-stock-in/10 text-stock-in",
  },
  low: {
    label: "Only a few left",
    className: "bg-stock-low/15 text-stock-low",
  },
  out: {
    label: "Out of stock",
    className: "bg-stock-out/15 text-stock-out-foreground",
  },
};

function DetailSkeleton() {
  return (
    <div
      data-ocid="loading_state"
      aria-busy="true"
      aria-label="Loading product"
    >
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { productId: rawProductId } = useParams({ strict: false });
  const productId = parseProductId(rawProductId);
  const navigate = useNavigate();

  const productQuery = useProduct(productId);
  const product = productQuery.data ?? null;

  const categoryId = product?.categoryId;
  const relatedQuery = useProductsByCategory(categoryId);

  const { data: cart } = useCart();
  const addToCart = useAddToCart();
  const setCartQuantity = useSetCartQuantity();
  const toggleWishlist = useToggleWishlist();
  const wishlisted = useIsWishlisted(productId);
  const recordViewed = useRecordRecentlyViewed();

  const cartQuantity = useMemo(() => {
    if (!cart || productId === undefined) return 0;
    const line = cart.items.find((item) => item.productId === productId);
    return line ? toNumber(line.quantity) : 0;
  }, [cart, productId]);

  const { mutate: recordViewedMutate } = recordViewed;
  useEffect(() => {
    if (productId === undefined) return;
    recordViewedMutate(productId);
  }, [productId, recordViewedMutate]);

  const related = useMemo(() => {
    const items = relatedQuery.data ?? [];
    return items.filter((item) => item.id !== productId).slice(0, 6);
  }, [relatedQuery.data, productId]);

  const busy =
    addToCart.isPending ||
    setCartQuantity.isPending ||
    toggleWishlist.isPending;

  const handleAdd = () => {
    if (productId === undefined) return;
    addToCart.mutate({ productId, quantity: 1n });
  };

  const handleIncrement = () => {
    if (productId === undefined) return;
    setCartQuantity.mutate({ productId, quantity: BigInt(cartQuantity + 1) });
  };

  const handleDecrement = () => {
    if (productId === undefined) return;
    setCartQuantity.mutate({
      productId,
      quantity: BigInt(Math.max(cartQuantity - 1, 0)),
    });
  };

  const handleToggleWishlist = () => {
    if (productId === undefined) return;
    toggleWishlist.mutate(productId);
  };

  const handleOpenRelated = (item: Product) => {
    void navigate({
      to: "/products/$productId",
      params: { productId: item.id.toString() },
    });
  };

  const goBack = () => {
    void navigate({ to: "/" });
  };

  const header = (
    <div className="mb-3 flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Go back"
        data-ocid="back_button"
        onClick={goBack}
        className="h-9 w-9 rounded-full"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-center font-display text-base font-semibold text-foreground">
        {product ? product.name : "Product"}
      </h1>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wishlisted}
        data-ocid="wishlist_toggle_button"
        disabled={productId === undefined || busy}
        onClick={handleToggleWishlist}
        className="h-9 w-9 rounded-full"
      >
        <Heart
          className={cn(
            "h-5 w-5",
            wishlisted && "fill-destructive text-destructive",
          )}
          aria-hidden="true"
        />
      </Button>
    </div>
  );

  if (productId === undefined) {
    return (
      <Layout>
        {header}
        <EmptyState
          icon={PackageX}
          title="Product not found"
          message="This product link looks broken. Browse the store to find what you need."
          actionLabel="Go to home"
          onAction={goBack}
        />
      </Layout>
    );
  }

  if (productQuery.isLoading) {
    return (
      <Layout>
        {header}
        <DetailSkeleton />
      </Layout>
    );
  }

  if (productQuery.isError) {
    return (
      <Layout>
        {header}
        <ErrorState
          title="Couldn't load this product"
          message="We couldn't fetch the product details. Please try again."
          onRetry={() => void productQuery.refetch()}
        />
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        {header}
        <EmptyState
          icon={PackageX}
          title="Product not found"
          message="This product may have been removed or is no longer available."
          actionLabel="Go to home"
          onAction={goBack}
        />
      </Layout>
    );
  }

  const state = stockState(product);
  const stock = STOCK_COPY[state];
  const outOfStock = state === "out";
  const inCart = cartQuantity > 0;
  const saved = savingsPaise(product.originalPrice, product.discountPrice);

  return (
    <Layout>
      {header}

      <article data-ocid="product_detail" className="pb-28">
        <div className="relative overflow-hidden rounded-lg border border-border bg-well">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={cn(
                "aspect-square w-full object-cover",
                outOfStock && "opacity-50 grayscale",
              )}
            />
          ) : (
            <span className="flex aspect-square w-full items-center justify-center font-display text-5xl font-bold text-muted-foreground">
              {product.name.charAt(0).toUpperCase()}
            </span>
          )}
          {product.discountPercent > 0n && !outOfStock ? (
            <DiscountBadge
              originalPrice={product.originalPrice}
              price={product.discountPrice}
              className="absolute left-3 top-3 px-2 py-1 text-xs"
            />
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {product.brand}
              </p>
              <h2 className="mt-0.5 font-display text-xl font-bold leading-tight text-foreground">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.packSize}
              </p>
            </div>
            <span
              data-ocid="stock_status"
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                stock.className,
              )}
            >
              {stock.label}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <PriceTag
              price={product.discountPrice}
              originalPrice={product.originalPrice}
              size="lg"
            />
            {saved > 0n ? (
              <p className="mt-1 text-sm font-semibold text-savings">
                You save {formatPaise(saved)}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
            <Truck
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>Delivery in 30 minutes to your saved address</span>
          </div>

          <section aria-labelledby="product-description-heading">
            <h3
              id="product-description-heading"
              className="font-display text-sm font-semibold text-foreground"
            >
              Product details
            </h3>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description ||
                "No description available for this product."}
            </p>
          </section>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>Quality checked · Easy returns within 24 hours</span>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-6" aria-labelledby="related-heading">
            <h3
              id="related-heading"
              className="mb-3 font-display text-base font-semibold text-foreground"
            >
              More from this category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map((item) => (
                <ProductCard
                  key={item.id.toString()}
                  product={item}
                  onOpen={handleOpenRelated}
                />
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-nav-top backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <PriceTag
              price={product.discountPrice}
              originalPrice={product.originalPrice}
              size="md"
            />
          </div>
          {outOfStock ? (
            <Button
              type="button"
              variant="outline"
              disabled
              data-ocid="add_to_cart_button"
              className="h-11 min-w-40 rounded-full"
            >
              Out of stock
            </Button>
          ) : inCart ? (
            <QuantityStepper
              quantity={cartQuantity}
              disabled={busy}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              className="h-11 min-w-40 justify-between px-1"
            />
          ) : (
            <Button
              type="button"
              disabled={busy}
              data-ocid="add_to_cart_button"
              onClick={handleAdd}
              className="h-11 min-w-40 gap-2 rounded-full font-semibold"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
