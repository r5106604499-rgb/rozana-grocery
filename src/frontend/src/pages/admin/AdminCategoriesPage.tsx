import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAddCategory, useAdminCategories } from "@/hooks/useAdmin";
import { toNumber } from "@/lib/format";
import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

function CategoriesContent() {
  const categoriesQuery = useAdminCategories();
  const addCategory = useAdminAddCategory();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedImage = imageUrl.trim();

    if (!trimmedName) {
      setError("Enter a category name.");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Category name must be at least 2 characters.");
      return;
    }

    const capturedName = trimmedName;
    const capturedImage = trimmedImage;
    setName("");
    setImageUrl("");
    setError(null);

    addCategory.mutate(
      { name: capturedName, imageUrl: capturedImage },
      {
        onError: (mutationError) => {
          setError(mutationError.message);
          setName((current) => (current === "" ? capturedName : current));
          setImageUrl((current) => (current === "" ? capturedImage : current));
        },
      },
    );
  };

  return (
    <AdminQueryState
      isLoading={categoriesQuery.isLoading}
      isError={categoriesQuery.isError}
      onRetry={() => void categoriesQuery.refetch()}
    >
      <div className="space-y-5">
        <form
          onSubmit={submit}
          data-ocid="admin_category_form"
          className="space-y-3 rounded-lg border border-border bg-card p-4"
        >
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Add a category
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              data-ocid="admin_category_name_input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Fresh Vegetables"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category-image">Image URL</Label>
            <Input
              id="category-image"
              data-ocid="admin_category_image_input"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://…"
            />
          </div>
          {error ? (
            <p
              data-ocid="admin_category_form_error"
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            data-ocid="admin_add_category_button"
            disabled={addCategory.isPending}
            className="w-full gap-1.5 rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {addCategory.isPending ? "Adding…" : "Add category"}
          </Button>
        </form>

        <section aria-labelledby="admin-category-list">
          <h2
            id="admin-category-list"
            className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Categories ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No categories yet"
              message="Add your first category to organise the catalogue."
            />
          ) : (
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li
                  key={category.id.toString()}
                  data-ocid={`admin_category_item.${index + 1}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-well">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <LayoutGrid
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {toNumber(category.productCount)} products
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminQueryState>
  );
}

export function AdminCategoriesPage() {
  return (
    <Layout title="Manage categories">
      <AdminGuard>
        <CategoriesContent />
      </AdminGuard>
    </Layout>
  );
}
