import { CategoryChip } from "@/components/CategoryChip";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses } from "@/hooks/useAddress";
import { useAddToCart, useCart, useSetCartQuantity } from "@/hooks/useCart";
import {
  useCategories,
  useHomeFeeds,
  useRecentlyViewed,
} from "@/hooks/useProducts";
import { useToggleWishlist, useWishlist } from "@/hooks/useWishlist";
import { APP_NAME } from "@/lib/constants";
import { toNumber } from "@/lib/format";
import type { Category, Product, ProductId } from "@/types/app";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Flame,
  MapPin,
  PackageOpen,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

const SEARCH_PLACEHOLDER = "Search for rice, atta, biscuits...";

const RAIL_SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `rail-${i}`);
const GRID_SKELETON_IDS = Array.from({ length: 8 }, (_, i) => `grid-${i}`);

interface SectionConfig {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Flame;
  products: Product[];
  emptyMessage: string;
}

/** Home screen: search, address, categories and curated product feeds. */
export function HomePage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const categoriesQuery = useCategories();
  const feedsQuery = useHomeFeeds();
  const recentlyViewedQuery = useRecentlyViewed();
  const cartQuery = useCart();
  const wishlistQuery = useWishlist();
  const addressesQuery = useAddresses();

  const addToCart = useAddToCart();
  const setCartQuantity = useSetCartQuantity();
  const toggleWishlist = useToggleWishlist();

  const categories = categoriesQuery.data ?? [];
  const feeds = feedsQuery.data;
  const recentlyViewedIds = recentlyViewedQuery.data ?? [];
  const cart = cartQuery.data;
  const wishlist = wishlistQuery.data ?? [];
  const addresses = addressesQuery.data ?? [];

  const activeAddress = addresses[0]?.address;
  const addressLabel = activeAddress
    ? [activeAddress.houseFlat, activeAddress.area, activeAddress.pincode]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const quantityByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart?.items ?? []) {
      map.set(item.productId.toString(), toNumber(item.quantity));
    }
    return map;
  }, [cart]);

  const wishlistSet = useMemo(
    () => new Set(wishlist.map((id) => id.toString())),
    [wishlist],
  );

  const recentlyViewedProducts = useMemo(() => {
    if (!feeds) return [];
    const pool = [
      ...feeds.todaysDeals,
      ...feeds.bestSelling,
      ...feeds.newArrivals,
      ...feeds.discounted,
      ...feeds.recommended,
    ];
    const byId = new Map<string, Product>();
    for (const product of pool) byId.set(product.id.toString(), product);
    const seen = new Set<string>();
    const result: Product[] = [];
    for (const id of recentlyViewedIds) {
      const key = id.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      const product = byId.get(key);
      if (product) result.push(product);
    }
    return result;
  }, [feeds, recentlyViewedIds]);

  const sections: SectionConfig[] = feeds
    ? [
        {
          key: "deals",
          title: "Today's Deals",
          subtitle: "Fresh price drops, today only",
          icon: Flame,
          products: feeds.todaysDeals,
          emptyMessage: "No deals running right now. Check back soon.",
        },
        {
          key: "best-selling",
          title: "Best Selling",
          subtitle: "Loved by your neighbourhood",
          icon: TrendingUp,
          products: feeds.bestSelling,
          emptyMessage: "Best sellers will appear here shortly.",
        },
        {
          key: "new-arrivals",
          title: "New Arrivals",
          subtitle: "Just landed on the shelves",
          icon: Sparkles,
          products: feeds.newArrivals,
          emptyMessage: "No new arrivals yet. Fresh stock is on the way.",
        },
        {
          key: "discounted",
          title: "Discount Section",
          subtitle: "Everyday savings on daily essentials",
          icon: Flame,
          products: feeds.discounted,
          emptyMessage: "No discounted items available right now.",
        },
        {
          key: "recently-viewed",
          title: "Recently Viewed",
          subtitle: "Pick up where you left off",
          icon: PackageOpen,
          products: recentlyViewedProducts,
          emptyMessage: "Products you open will show up here.",
        },
        {
          key: "recommended",
          title: "Recommended",
          subtitle: "Handpicked for your kitchen",
          icon: Sparkles,
          products: feeds.recommended,
          emptyMessage: "Recommendations will appear as you shop.",
        },
      ]
    : [];

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    void navigate({ to: "/search", search: { q: query } });
  };

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
  const categoriesLoading = categoriesQuery.isLoading;
  const categoriesError = categoriesQuery.isError;
  const feedsLoading = feedsQuery.isLoading;
  const feedsError = feedsQuery.isError;

  const retryAll = () => {
    void categoriesQuery.refetch();
    void feedsQuery.refetch();
    void recentlyViewedQuery.refetch();
  };

  return (
    <Layout>
      <div data-ocid="home_page" className="space-y-6">
        {/* Sticky search + address */}
        <section
          data-ocid="home_search_section"
          className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 pb-3 pt-1 backdrop-blur"
        >
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-input bg-card py-1 pl-4 pr-1 shadow-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={SEARCH_PLACEHOLDER}
                aria-label="Search products"
                data-ocid="home_search_input"
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Search"
                data-ocid="home_search_button"
                className="h-8 w-8 shrink-0 rounded-full"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </form>

          <Link
            to="/addresses"
            data-ocid="home_address_link"
            className="mt-2.5 flex items-center gap-2 rounded-lg px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Deliver to
              </span>
              <span className="block truncate text-sm font-semibold text-foreground">
                {addressesQuery.isLoading
                  ? "Loading address…"
                  : (addressLabel ?? "Set your delivery address")}
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </Link>
        </section>

        {/* Category rail */}
        <section
          data-ocid="home_category_rail_section"
          aria-labelledby="rail-heading"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <h2
              id="rail-heading"
              className="font-display text-base font-bold tracking-tight text-foreground"
            >
              Shop by category
            </h2>
            <Link
              to="/categories"
              data-ocid="home_all_categories_link"
              className="flex items-center gap-0.5 text-xs font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              See all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div
              data-ocid="home_category_rail_loading"
              aria-busy="true"
              aria-label="Loading categories"
              className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1"
            >
              {RAIL_SKELETON_IDS.map((id) => (
                <div
                  key={id}
                  className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
                >
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <ErrorState
              title="Couldn't load categories"
              message="We couldn't fetch the grocery aisles. Please try again."
              onRetry={() => void categoriesQuery.refetch()}
            />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No categories yet"
              message="Our aisles are being stocked. Please check back in a moment."
            />
          ) : (
            <div
              data-ocid="home_category_rail"
              className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1"
            >
              {categories.map((category) => (
                <CategoryChip
                  key={category.id.toString()}
                  category={category}
                  onSelect={(categoryId) =>
                    void navigate({
                      to: "/categories/$categoryId",
                      params: { categoryId: categoryId.toString() },
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Today's Deals promo banner */}
        <section data-ocid="home_deal_banner_section">
          <Link
            to="/categories"
            data-ocid="home_deal_banner"
            className="bg-gradient-deal relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-4 py-4 shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground/80">
                Today&apos;s Deals
              </p>
              <p className="font-display text-lg font-extrabold leading-tight text-accent-foreground">
                Up to 40% off daily essentials
              </p>
              <p className="mt-0.5 text-xs font-medium text-accent-foreground/80">
                Fresh savings on rice, atta, snacks &amp; more
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-foreground/15 text-accent-foreground">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </span>
          </Link>
        </section>

        {/* Full category grid */}
        <section
          data-ocid="home_category_grid_section"
          aria-labelledby="grid-heading"
        >
          <h2
            id="grid-heading"
            className="mb-2.5 font-display text-base font-bold tracking-tight text-foreground"
          >
            All categories
          </h2>

          {categoriesLoading ? (
            <div
              data-ocid="home_category_grid_loading"
              aria-busy="true"
              aria-label="Loading categories"
              className="grid grid-cols-3 gap-3"
            >
              {GRID_SKELETON_IDS.slice(0, 6).map((id) => (
                <div
                  key={id}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <ErrorState
              title="Couldn't load categories"
              message="We couldn't fetch the grocery aisles. Please try again."
              onRetry={() => void categoriesQuery.refetch()}
            />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No categories yet"
              message="Our aisles are being stocked. Please check back in a moment."
            />
          ) : (
            <div
              data-ocid="home_category_grid"
              className="grid grid-cols-3 gap-3"
            >
              {categories.map((category) => (
                <CategoryGridTile
                  key={category.id.toString()}
                  category={category}
                />
              ))}
            </div>
          )}
        </section>

        {/* Product feeds */}
        {feedsError ? (
          <ErrorState
            title="Couldn't load products"
            message="We couldn't fetch today's picks. Please check your connection and try again."
            onRetry={retryAll}
          />
        ) : feedsLoading ? (
          <div className="space-y-6">
            {["a", "b"].map((id) => (
              <section key={id} className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <LoadingState variant="grid" rows={4} />
              </section>
            ))}
          </div>
        ) : (
          sections.map((section) => (
            <ProductSection
              key={section.key}
              section={section}
              quantityByProduct={quantityByProduct}
              wishlistSet={wishlistSet}
              busy={cartBusy}
              onAdd={handleAdd}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onToggleWishlist={handleToggleWishlist}
              onOpen={openProduct}
            />
          ))
        )}
      </div>
    </Layout>
  );
}

interface CategoryGridTileProps {
  category: Category;
}

/** Compact square category tile used in the full home grid. */
function CategoryGridTile({ category }: CategoryGridTileProps) {
  return (
    <Link
      to="/categories/$categoryId"
      params={{ categoryId: category.id.toString() }}
      data-ocid="home_category_grid_item"
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 text-center shadow-subtle transition-smooth hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-well">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-lg font-bold text-primary">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
        {category.name}
      </span>
    </Link>
  );
}

interface ProductSectionProps {
  section: SectionConfig;
  quantityByProduct: Map<string, number>;
  wishlistSet: Set<string>;
  busy: boolean;
  onAdd: (product: Product) => void;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onOpen: (product: Product) => void;
}

/** One titled product grid with its own empty state. */
function ProductSection({
  section,
  quantityByProduct,
  wishlistSet,
  busy,
  onAdd,
  onIncrement,
  onDecrement,
  onToggleWishlist,
  onOpen,
}: ProductSectionProps) {
  const Icon = section.icon;
  const headingId = `section-${section.key}`;

  return (
    <section
      data-ocid={`home_section_${section.key}`}
      aria-labelledby={headingId}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-display text-base font-bold tracking-tight text-foreground"
          >
            {section.title}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {section.subtitle}
          </p>
        </div>
      </div>

      {section.products.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={`No ${section.title.toLowerCase()} yet`}
          message={section.emptyMessage}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {section.products.map((product) => {
            const key = product.id.toString();
            return (
              <ProductCard
                key={key}
                product={product}
                quantity={quantityByProduct.get(key) ?? 0}
                wishlisted={wishlistSet.has(key)}
                busy={busy}
                onAdd={onAdd}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onToggleWishlist={onToggleWishlist}
                onOpen={onOpen}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
