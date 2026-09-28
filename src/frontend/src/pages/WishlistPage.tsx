import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAddToCart, useCart, useSetCartQuantity } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProducts";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { toNumber } from "@/lib/format";
import type { Product, ProductId } from "@/types/app";
import { useNavigate } from "@tanstack/react-router";
import { Heart, LogIn } from "lucide-react";
import { useMemo } from "react";

interface WishlistItemProps {
  productId: ProductId;
  quantity: number;
  busy: boolean;
  onAdd: (product: Product) => void;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onOpen: (product: Product) => void;
}

/** Resolves one wishlisted product id into a shared ProductCard. */
function WishlistItem({
  productId,
  quantity,
  busy,
  onAdd,
  onIncrement,
  onDecrement,
  onToggleWishlist,
  onOpen,
}: WishlistItemProps) {
  const productQuery = useProduct(productId);
  const product = productQuery.data;

  if (productQuery.isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="aspect-square w-full animate-pulse bg-muted" />
        <div className="space-y-2 p-3">
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <ProductCard
      product={product}
      quantity={quantity}
      wishlisted
      busy={busy}
      onAdd={onAdd}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      onToggleWishlist={onToggleWishlist}
      onOpen={onOpen}
    />
  );
}

/** The signed-in user's wishlisted products in a grid. */
export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const wishlistQuery = useWishlist();
  const cartQuery = useCart();
  const addToCart = useAddToCart();
  const setCartQuantity = useSetCartQuantity();
  const toggleWishlist = useToggleWishlist();

  const wishlist = wishlistQuery.data ?? [];
  const cart = cartQuery.data;

  const quantityByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart?.items ?? []) {
      map.set(item.productId.toString(), toNumber(item.quantity));
    }
    return map;
  }, [cart]);

  const openProduct = (product: Product) => {
    void navigate({
      to: "/products/$productId",
      params: { productId: product.id.toString() },
    });
  };

  const handleAdd = (product: Product) => {
    addToCart.mutate({ productId: product.id, quantity: 1n });
  };

  const handleIncrement = (product: Product) => {
    const current = quantityByProduct.get(product.id.toString()) ?? 0;
    setCartQuantity.mutate({
      productId: product.id,
      quantity: BigInt(current + 1),
    });
  };

  const handleDecrement = (product: Product) => {
    const current = quantityByProduct.get(product.id.toString()) ?? 0;
    setCartQuantity.mutate({
      productId: product.id,
      quantity: BigInt(Math.max(current - 1, 0)),
    });
  };

  const handleToggleWishlist = (product: Product) => {
    toggleWishlist.mutate(product.id);
  };

  const cartBusy = addToCart.isPending || setCartQuantity.isPending;

  if (isInitializing) {
    return (
      <Layout title="Wishlist">
        <LoadingState variant="grid" rows={4} />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout title="Wishlist">
        <EmptyState
          icon={LogIn}
          title="Sign in to see your wishlist"
          message="Log in with Internet Identity to save products and find them here later."
        >
          <Button
            type="button"
            data-ocid="wishlist_login_button"
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

  if (wishlistQuery.isError) {
    return (
      <Layout title="Wishlist">
        <ErrorState
          title="Couldn't load your wishlist"
          message="We couldn't fetch your saved products. Please try again."
          onRetry={() => void wishlistQuery.refetch()}
        />
      </Layout>
    );
  }

  if (wishlistQuery.isLoading) {
    return (
      <Layout title="Wishlist">
        <LoadingState variant="grid" rows={4} />
      </Layout>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Layout title="Wishlist">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart on any product to save it for later."
          actionLabel="Browse products"
          onAction={() => void navigate({ to: "/" })}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Wishlist">
      <div data-ocid="wishlist_page" className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
        <div data-ocid="wishlist_grid" className="grid grid-cols-2 gap-3">
          {wishlist.map((productId) => (
            <WishlistItem
              key={productId.toString()}
              productId={productId}
              quantity={quantityByProduct.get(productId.toString()) ?? 0}
              busy={cartBusy || toggleWishlist.isPending}
              onAdd={handleAdd}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onToggleWishlist={handleToggleWishlist}
              onOpen={openProduct}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
