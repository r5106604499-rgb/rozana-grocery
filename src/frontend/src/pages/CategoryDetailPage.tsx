import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAddToCart, useCart, useSetCartQuantity } from "@/hooks/useCart";
import { useCategory, useProductsByCategory } from "@/hooks/useProducts";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { formatPaise, toNumber } from "@/lib/format";
import type { Product } from "@/types/app";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { PackageOpen, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "price-asc" | "price-desc" | "discount" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "newest", label: "Newest first" },
];

/** Highest product price in paise, rounded up to the nearest ₹50 for the slider. */
function priceCeiling(products: Product[]): number {
  const max = products.reduce(
    (acc, product) => Math.max(acc, Number(product.discountPrice)),
    0,
  );
  return Math.max(5000, Math.ceil(max / 5000) * 5000);
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort(
        (a, b) => Number(a.discountPrice) - Number(b.discountPrice),
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => Number(b.discountPrice) - Number(a.discountPrice),
      );
    case "discount":
      return sorted.sort(
        (a, b) => Number(b.discountPercent) - Number(a.discountPercent),
      );
    case "newest":
      return sorted.sort((a, b) => Number(b.createdAt - a.createdAt));
  }
}

/** Product grid for one category with sort and price-range controls. */
export function CategoryDetailPage() {
  const { categoryId } = useParams({ from: "/categories/$categoryId" });
  const navigate = useNavigate();
  const id = BigInt(categoryId);

  const { data: category } = useCategory(id);
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProductsByCategory(id);

  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const addToCart = useAddToCart();
  const setQuantity = useSetCartQuantity();
  const toggleWishlist = useToggleWishlist();

  const [sort, setSort] = useState<SortKey>("price-asc");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const ceiling = useMemo(() => priceCeiling(products ?? []), [products]);
  const activeMax = maxPrice ?? ceiling;

  const visible = useMemo(() => {
    const list = (products ?? []).filter(
      (product) => Number(product.discountPrice) <= activeMax,
    );
    return sortProducts(list, sort);
  }, [products, activeMax, sort]);

  const quantityFor = (productId: bigint): number => {
    const line = cart?.items.find((item) => item.productId === productId);
    return line ? toNumber(line.quantity) : 0;
  };

  const isWishlisted = (productId: bigint): boolean =>
    !!wishlist?.some((wishId) => wishId === productId);

  const busy = addToCart.isPending || setQuantity.isPending;

  const handleAdd = (product: Product) => {
    addToCart.mutate({ productId: product.id, quantity: 1n });
  };

  const handleIncrement = (product: Product) => {
    setQuantity.mutate({
      productId: product.id,
      quantity: BigInt(quantityFor(product.id) + 1),
    });
  };

  const handleDecrement = (product: Product) => {
    setQuantity.mutate({
      productId: product.id,
      quantity: BigInt(Math.max(0, quantityFor(product.id) - 1)),
    });
  };

  const handleOpen = (product: Product) => {
    void navigate({
      to: "/products/$productId",
      params: { productId: product.id.toString() },
    });
  };

  const hasProducts = !!products && products.length > 0;
  const filterActive = maxPrice !== null && maxPrice < ceiling;

  return (
    <Layout title={category?.name ?? "Category"}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          to="/categories"
          data-ocid="back_to_categories_link"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← All categories
        </Link>
        {hasProducts ? (
          <span className="text-xs text-muted-foreground">
            {visible.length} of {products.length}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingState variant="grid" rows={6} />
      ) : isError ? (
        <ErrorState
          title="Couldn't load products"
          message="We couldn't fetch products for this category. Please try again."
          onRetry={() => void refetch()}
        />
      ) : !hasProducts ? (
        <EmptyState
          icon={PackageOpen}
          title="Nothing here yet"
          message="Products in this category will appear here soon."
          actionLabel="Browse categories"
          onAction={() => void navigate({ to: "/categories" })}
        />
      ) : (
        <>
          <div className="mb-4 space-y-3 rounded-lg border border-border bg-card p-3 shadow-subtle">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Sort
              </span>
              <Select
                value={sort}
                onValueChange={(value) => setSort(value as SortKey)}
              >
                <SelectTrigger
                  size="sm"
                  data-ocid="sort_select"
                  aria-label="Sort products"
                  className="w-[170px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Max price
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatPaise(BigInt(activeMax))}
                </span>
              </div>
              <Slider
                value={[activeMax]}
                min={5000}
                max={ceiling}
                step={5000}
                aria-label="Maximum price"
                data-ocid="price_range_slider"
                onValueChange={(values) => setMaxPrice(values[0] ?? ceiling)}
              />
              {filterActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid="clear_filter_button"
                  onClick={() => setMaxPrice(null)}
                  className="h-7 px-2 text-xs text-primary"
                >
                  Clear price filter
                </Button>
              ) : null}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No products in this range"
              message={`Nothing under ${formatPaise(BigInt(activeMax))}. Try raising the price limit.`}
              actionLabel="Clear price filter"
              onAction={() => setMaxPrice(null)}
            />
          ) : (
            <section
              data-ocid="product_grid"
              aria-label="Products"
              className="grid grid-cols-2 gap-3"
            >
              {visible.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  quantity={quantityFor(product.id)}
                  wishlisted={isWishlisted(product.id)}
                  busy={busy}
                  onAdd={handleAdd}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onToggleWishlist={(item) => toggleWishlist.mutate(item.id)}
                  onOpen={handleOpen}
                />
              ))}
            </section>
          )}
        </>
      )}
    </Layout>
  );
}
