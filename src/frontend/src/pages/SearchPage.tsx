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
import { useCategories, useSearchProducts } from "@/hooks/useProducts";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { formatPaise, toNumber } from "@/lib/format";
import type { Product, ProductFilter } from "@/types/app";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PackageOpen, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SortKey = "relevance" | "price-asc" | "price-desc" | "discount";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
];

const PRICE_CEILING = 100000; // ₹1000 in paise
const PRICE_STEP = 5000; // ₹50

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
    case "relevance":
      return sorted;
  }
}

/** Search groceries by name and brand with URL-persisted filters. */
export function SearchPage() {
  const search = useSearch({ from: "/search" });
  const navigate = useNavigate();

  const { data: categories } = useCategories();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const addToCart = useAddToCart();
  const setQuantity = useSetCartQuantity();
  const toggleWishlist = useToggleWishlist();

  const [term, setTerm] = useState(search.q ?? "");

  // Keep the input in sync when the URL query changes (e.g. header search).
  useEffect(() => {
    setTerm(search.q ?? "");
  }, [search.q]);

  const categoryId = search.categoryId;
  const minPrice = search.minPrice;
  const maxPrice = search.maxPrice;
  const sort: SortKey = SORT_OPTIONS.some(
    (option) => option.value === search.sort,
  )
    ? (search.sort as SortKey)
    : "relevance";

  const filter: ProductFilter = useMemo(
    () => ({
      searchTerm: search.q,
      categoryId: categoryId !== undefined ? BigInt(categoryId) : undefined,
      minPrice: minPrice !== undefined ? BigInt(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? BigInt(maxPrice) : undefined,
      inStockOnly: false,
    }),
    [search.q, categoryId, minPrice, maxPrice],
  );

  const hasQuery = !!search.q && search.q.trim().length > 0;
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useSearchProducts(filter, hasQuery);

  const visible = useMemo(
    () => sortProducts(products ?? [], sort),
    [products, sort],
  );

  const updateSearch = (patch: Record<string, string | number | undefined>) => {
    void navigate({
      to: "/search",
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });
  };

  const submitTerm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearch({ q: term.trim() || undefined });
  };

  const clearTerm = () => {
    setTerm("");
    updateSearch({ q: undefined });
  };

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

  const activeCategory = categories?.find(
    (category) => category.id.toString() === categoryId,
  );
  const hasFilters =
    categoryId !== undefined ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    sort !== "relevance";

  return (
    <Layout title="Search">
      <form onSubmit={submitTerm} className="mb-3">
        <div className="flex items-center gap-2 rounded-full border border-input bg-card py-1 pl-4 pr-1 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
          <Search
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search rice, atta, biscuits..."
            aria-label="Search products"
            data-ocid="search_input"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {term ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              data-ocid="clear_search_button"
              onClick={clearTerm}
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
          <Button
            type="submit"
            size="icon"
            aria-label="Search"
            data-ocid="search_button"
            className="h-8 w-8 shrink-0 rounded-full"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </form>

      <div className="mb-4 space-y-3 rounded-lg border border-border bg-card p-3 shadow-subtle">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Filters
          </span>
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="clear_filters_button"
              onClick={() =>
                updateSearch({
                  categoryId: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  sort: undefined,
                })
              }
              className="h-7 px-2 text-xs text-primary"
            >
              Clear all
            </Button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Category
          </span>
          <Select
            value={categoryId ?? "all"}
            onValueChange={(value) =>
              updateSearch({
                categoryId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger
              size="sm"
              data-ocid="category_filter_select"
              aria-label="Filter by category"
              className="w-[170px]"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((category) => (
                <SelectItem
                  key={category.id.toString()}
                  value={category.id.toString()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Sort
          </span>
          <Select
            value={sort}
            onValueChange={(value) =>
              updateSearch({
                sort: value === "relevance" ? undefined : value,
              })
            }
          >
            <SelectTrigger
              size="sm"
              data-ocid="sort_select"
              aria-label="Sort results"
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
            <span className="text-xs font-medium text-muted-foreground">
              Max price
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatPaise(BigInt(maxPrice ?? PRICE_CEILING))}
            </span>
          </div>
          <Slider
            value={[maxPrice ?? PRICE_CEILING]}
            min={PRICE_STEP}
            max={PRICE_CEILING}
            step={PRICE_STEP}
            aria-label="Maximum price"
            data-ocid="price_range_slider"
            onValueChange={(values) =>
              updateSearch({
                maxPrice:
                  values[0] === undefined || values[0] >= PRICE_CEILING
                    ? undefined
                    : values[0],
              })
            }
          />
        </div>
      </div>

      {!hasQuery ? (
        <EmptyState
          icon={Search}
          title="Search groceries"
          message="Type a product name or brand to find what you need."
        />
      ) : isLoading ? (
        <LoadingState variant="grid" rows={6} />
      ) : isError ? (
        <ErrorState
          title="Search failed"
          message="We couldn't run your search. Please try again."
          onRetry={() => void refetch()}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No products found"
          message={
            activeCategory
              ? `Nothing matched "${search.q}" in ${activeCategory.name}. Try a different term or clear the filters.`
              : `Nothing matched "${search.q}". Try a different term or clear the filters.`
          }
          actionLabel={hasFilters ? "Clear filters" : undefined}
          onAction={
            hasFilters
              ? () =>
                  updateSearch({
                    categoryId: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    sort: undefined,
                  })
              : undefined
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            {visible.length} {visible.length === 1 ? "result" : "results"} for “
            {search.q}”
          </p>
          <section
            data-ocid="product_grid"
            aria-label="Search results"
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
        </>
      )}
    </Layout>
  );
}
