import { DiscountBadge, PriceTag } from "@/components/PriceTag";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/app";
import { Heart, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  /** Current quantity in the cart, 0 when absent. */
  quantity?: number;
  wishlisted?: boolean;
  onAdd?: (product: Product) => void;
  onIncrement?: (product: Product) => void;
  onDecrement?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onOpen?: (product: Product) => void;
  /** Disable actions while a mutation is in flight. */
  busy?: boolean;
  className?: string;
}

/** Product tile used across home, category, search and wishlist grids. */
export function ProductCard({
  product,
  quantity = 0,
  wishlisted = false,
  onAdd,
  onIncrement,
  onDecrement,
  onToggleWishlist,
  onOpen,
  busy = false,
  className,
}: ProductCardProps) {
  const outOfStock = !product.inStock || product.stockQuantity <= 0n;
  const inCart = quantity > 0;

  return (
    <article
      data-ocid="product_card"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-subtle transition-smooth hover:shadow-card-hover",
        className,
      )}
    >
      <button
        type="button"
        data-ocid="product_open_button"
        onClick={() => onOpen?.(product)}
        aria-label={`View ${product.name}`}
        className="relative block aspect-square w-full overflow-hidden bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-smooth group-hover:scale-105",
              outOfStock && "opacity-45 grayscale",
            )}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-muted-foreground">
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}
        {product.discountPercent > 0n && !outOfStock ? (
          <DiscountBadge
            originalPrice={product.originalPrice}
            price={product.discountPrice}
            className="absolute left-2 top-2"
          />
        ) : null}
        {outOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-stock-out/90 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-stock-out-foreground">
            Out of stock
          </span>
        ) : null}
      </button>

      {onToggleWishlist ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          data-ocid="wishlist_toggle_button"
          disabled={busy}
          onClick={() => onToggleWishlist(product)}
          className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-card/85 text-muted-foreground backdrop-blur hover:bg-card hover:text-destructive"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              wishlisted && "fill-destructive text-destructive",
            )}
            aria-hidden="true"
          />
        </Button>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-2.5">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 min-h-9 text-sm font-medium leading-tight text-foreground">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">{product.packSize}</p>

        <div className="mt-auto space-y-2 pt-1.5">
          <PriceTag
            price={product.discountPrice}
            originalPrice={product.originalPrice}
            showSavings
            size="sm"
          />
          {outOfStock ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              data-ocid="add_to_cart_button"
              className="w-full"
            >
              Unavailable
            </Button>
          ) : inCart ? (
            <QuantityStepper
              quantity={quantity}
              size="sm"
              disabled={busy}
              onIncrement={() => onIncrement?.(product)}
              onDecrement={() => onDecrement?.(product)}
              className="w-full justify-between"
            />
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              data-ocid="add_to_cart_button"
              onClick={() => onAdd?.(product)}
              className="w-full gap-1 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
