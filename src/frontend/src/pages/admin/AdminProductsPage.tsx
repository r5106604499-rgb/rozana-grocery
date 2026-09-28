import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAddProduct,
  useAdminCategories,
  useAdminDeleteProduct,
  useAdminProducts,
  useAdminSetStock,
  useAdminUpdateProduct,
} from "@/hooks/useAdmin";
import { formatPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryId, Product, ProductId } from "@/types/app";
import { ImagePlus, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface ProductFormState {
  categoryId: string;
  name: string;
  brand: string;
  packSize: string;
  imageUrl: string;
  originalPrice: string;
  discountPrice: string;
  stockQuantity: string;
  description: string;
}

const EMPTY_FORM: ProductFormState = {
  categoryId: "",
  name: "",
  brand: "",
  packSize: "",
  imageUrl: "",
  originalPrice: "",
  discountPrice: "",
  stockQuantity: "0",
  description: "",
};

/** Convert a rupee string to paise, returning null when invalid. */
function rupeesToPaise(value: string): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const rupees = Number(trimmed);
  if (!Number.isFinite(rupees) || rupees < 0) return null;
  return BigInt(Math.round(rupees * 100));
}

function productToForm(product: Product): ProductFormState {
  return {
    categoryId: product.categoryId.toString(),
    name: product.name,
    brand: product.brand,
    packSize: product.packSize,
    imageUrl: product.imageUrl,
    originalPrice: (Number(product.originalPrice) / 100).toString(),
    discountPrice: (Number(product.discountPrice) / 100).toString(),
    stockQuantity: product.stockQuantity.toString(),
    description: product.description,
  };
}

function ProductsContent() {
  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const addProduct = useAdminAddProduct();
  const updateProduct = useAdminUpdateProduct();
  const deleteProduct = useAdminDeleteProduct();
  const setStock = useAdminSetStock();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<ProductId | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term),
    );
  }, [products, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id.toString() ?? "",
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(productToForm(product));
    setFormError(null);
    setDialogOpen(true);
  };

  const updateField = (field: keyof ProductFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file (PNG, JPG or WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Image is too large. Choose a file under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("imageUrl", reader.result);
        setFormError(null);
      }
    };
    reader.onerror = () => setFormError("Couldn't read that image. Try again.");
    reader.readAsDataURL(file);
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const brand = form.brand.trim();
    const packSize = form.packSize.trim();
    const imageUrl = form.imageUrl.trim();
    const description = form.description.trim();
    const originalPrice = rupeesToPaise(form.originalPrice);
    const discountPrice = rupeesToPaise(form.discountPrice);
    const stockQuantity = Number(form.stockQuantity);

    if (!form.categoryId) {
      setFormError("Choose a category for this product.");
      return;
    }
    if (!name) {
      setFormError("Enter a product name.");
      return;
    }
    if (!brand) {
      setFormError("Enter the brand name.");
      return;
    }
    if (!packSize) {
      setFormError("Enter the pack size, e.g. 1 kg.");
      return;
    }
    if (originalPrice === null || originalPrice <= 0n) {
      setFormError("Enter a valid original price in rupees.");
      return;
    }
    if (discountPrice === null || discountPrice <= 0n) {
      setFormError("Enter a valid selling price in rupees.");
      return;
    }
    if (discountPrice > originalPrice) {
      setFormError("Selling price cannot be higher than the original price.");
      return;
    }
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      setFormError("Enter a valid stock quantity.");
      return;
    }

    const input = {
      categoryId: BigInt(form.categoryId) as CategoryId,
      name,
      brand,
      packSize,
      imageUrl,
      originalPrice,
      discountPrice,
      stockQuantity: BigInt(Math.trunc(stockQuantity)),
      description,
    };

    const onError = (error: Error) => setFormError(error.message);
    if (editingId !== null) {
      updateProduct.mutate(
        { productId: editingId, input },
        { onSuccess: () => setDialogOpen(false), onError },
      );
    } else {
      addProduct.mutate(input, {
        onSuccess: () => setDialogOpen(false),
        onError,
      });
    }
  };

  const adjustStock = (product: Product, delta: number) => {
    const next = toNumber(product.stockQuantity) + delta;
    if (next < 0) return;
    setStock.mutate({ productId: product.id, stockQuantity: BigInt(next) });
  };

  const markOutOfStock = (product: Product) => {
    setStock.mutate({ productId: product.id, stockQuantity: 0n });
  };

  const isSaving = addProduct.isPending || updateProduct.isPending;

  return (
    <AdminQueryState
      isLoading={productsQuery.isLoading || categoriesQuery.isLoading}
      isError={productsQuery.isError || categoriesQuery.isError}
      onRetry={() => {
        void productsQuery.refetch();
        void categoriesQuery.refetch();
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-input bg-card py-1 pl-3 pr-1 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or brands"
              aria-label="Search products"
              data-ocid="admin_products_search_input"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="button"
            data-ocid="admin_add_product_button"
            onClick={openAdd}
            className="shrink-0 gap-1.5 rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            message="Add your first grocery product to start selling."
            actionLabel="Add product"
            onAction={openAdd}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching products"
            message={`Nothing matches "${search.trim()}". Try a different name or brand.`}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="min-w-[180px]">Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product, index) => {
                  const stock = toNumber(product.stockQuantity);
                  const outOfStock = !product.inStock || stock <= 0;
                  return (
                    <TableRow
                      key={product.id.toString()}
                      data-ocid={`admin_product_row.${index + 1}`}
                    >
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-2">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-well">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Package
                                className="h-5 w-5 text-muted-foreground"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {product.brand} · {product.packSize}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-display font-semibold tabular-nums text-foreground">
                          {formatPaise(product.discountPrice)}
                        </span>
                        {product.originalPrice > product.discountPrice ? (
                          <span className="block text-xs text-strike">
                            {formatPaise(product.originalPrice)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={outOfStock ? "destructive" : "secondary"}
                            className={cn(
                              "tabular-nums",
                              !outOfStock &&
                                stock <= 5 &&
                                "bg-warning/20 text-warning-foreground",
                            )}
                          >
                            {outOfStock ? "Out of stock" : `${stock} in stock`}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Decrease stock for ${product.name}`}
                              data-ocid={`admin_stock_decrement_button.${index + 1}`}
                              disabled={stock <= 0 || setStock.isPending}
                              onClick={() => adjustStock(product, -1)}
                              className="h-7 w-7 rounded-full p-0"
                            >
                              −
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Increase stock for ${product.name}`}
                              data-ocid={`admin_stock_increment_button.${index + 1}`}
                              disabled={setStock.isPending}
                              onClick={() => adjustStock(product, 1)}
                              className="h-7 w-7 rounded-full p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${product.name}`}
                            data-ocid={`admin_edit_product_button.${index + 1}`}
                            onClick={() => openEdit(product)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Mark ${product.name} out of stock`}
                            data-ocid={`admin_out_of_stock_button.${index + 1}`}
                            disabled={outOfStock || setStock.isPending}
                            onClick={() => markOutOfStock(product)}
                            className="h-8 w-8 rounded-full text-warning-foreground"
                          >
                            <Package className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${product.name}`}
                            data-ocid={`admin_delete_product_button.${index + 1}`}
                            disabled={deleteProduct.isPending}
                            onClick={() => deleteProduct.mutate(product.id)}
                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              Prices are entered in rupees. Stock is the number of units
              available.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitForm} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => updateField("categoryId", value)}
              >
                <SelectTrigger
                  id="product-category"
                  data-ocid="admin_product_category_select"
                  className="w-full"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
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

            <div className="space-y-1.5">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                data-ocid="admin_product_name_input"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Basmati Rice"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="product-brand">Brand</Label>
                <Input
                  id="product-brand"
                  data-ocid="admin_product_brand_input"
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  placeholder="e.g. India Gate"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-pack">Pack size</Label>
                <Input
                  id="product-pack"
                  data-ocid="admin_product_pack_input"
                  value={form.packSize}
                  onChange={(event) =>
                    updateField("packSize", event.target.value)
                  }
                  placeholder="e.g. 1 kg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-image">Product image</Label>
              <div className="flex items-center gap-3">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-well">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus
                      className="h-6 w-6 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    data-ocid="admin_product_image_file_input"
                    onChange={handleImageFile}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="admin_product_image_upload_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 rounded-full"
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Upload image
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or WebP up to 2 MB.
                  </p>
                </div>
              </div>
              <Input
                id="product-image"
                data-ocid="admin_product_image_input"
                value={form.imageUrl}
                onChange={(event) =>
                  updateField("imageUrl", event.target.value)
                }
                placeholder="…or paste an image URL"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="product-original">Original ₹</Label>
                <Input
                  id="product-original"
                  inputMode="decimal"
                  data-ocid="admin_product_original_price_input"
                  value={form.originalPrice}
                  onChange={(event) =>
                    updateField("originalPrice", event.target.value)
                  }
                  placeholder="120"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-discount">Selling ₹</Label>
                <Input
                  id="product-discount"
                  inputMode="decimal"
                  data-ocid="admin_product_discount_price_input"
                  value={form.discountPrice}
                  onChange={(event) =>
                    updateField("discountPrice", event.target.value)
                  }
                  placeholder="99"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  inputMode="numeric"
                  data-ocid="admin_product_stock_input"
                  value={form.stockQuantity}
                  onChange={(event) =>
                    updateField("stockQuantity", event.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                data-ocid="admin_product_description_input"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Short description shown on the product page"
                rows={3}
              />
            </div>

            {formError ? (
              <p
                data-ocid="admin_product_form_error"
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="admin_product_cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin_product_save_button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving…"
                  : editingId !== null
                    ? "Save changes"
                    : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminQueryState>
  );
}

export function AdminProductsPage() {
  return (
    <Layout title="Manage products">
      <AdminGuard>
        <ProductsContent />
      </AdminGuard>
    </Layout>
  );
}
