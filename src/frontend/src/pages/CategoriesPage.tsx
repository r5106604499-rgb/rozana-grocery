import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { useCategories } from "@/hooks/useProducts";
import { toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, PackageOpen } from "lucide-react";

/** A single category tile in the browse grid. */
function CategoryTile({ category }: { category: Category }) {
  const count = toNumber(category.productCount);

  return (
    <Link
      to="/categories/$categoryId"
      params={{ categoryId: category.id.toString() }}
      data-ocid="category_card"
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="relative block aspect-square w-full overflow-hidden bg-well">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-primary/70">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 p-2.5">
        <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {category.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {count === 1 ? "1 item" : `${count} items`}
        </span>
      </span>
    </Link>
  );
}

/** Browse every grocery category with representative imagery. */
export function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories();

  const hasCategories = !!categories && categories.length > 0;

  return (
    <Layout title="Shop by category">
      {isLoading ? (
        <LoadingState variant="grid" rows={8} />
      ) : isError ? (
        <ErrorState
          title="Couldn't load categories"
          message="We couldn't fetch the category list. Please try again."
          onRetry={() => void refetch()}
        />
      ) : !hasCategories ? (
        <EmptyState
          icon={PackageOpen}
          title="No categories yet"
          message="Grocery categories will appear here once the catalogue is ready."
        />
      ) : (
        <section
          data-ocid="category_list"
          aria-label="Product categories"
          className={cn("grid grid-cols-2 gap-3")}
        >
          {categories.map((category) => (
            <CategoryTile key={category.id.toString()} category={category} />
          ))}
        </section>
      )}

      {hasCategories ? (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
          {categories.length} categories · fresh stock daily
        </p>
      ) : null}
    </Layout>
  );
}
