import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { Card } from "@/components/ui/card";
import { useAdminProducts, useAdminSalesSummary } from "@/hooks/useAdmin";
import { formatPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types/app";
import type { Product } from "@/types/app";
import {
  BarChart3,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

interface MetricProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "primary" | "accent" | "muted";
}

const TONE_CLASSES = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent-foreground",
  muted: "bg-secondary text-secondary-foreground",
} as const;

function Metric({ label, value, icon: Icon, tone }: MetricProps) {
  return (
    <Card
      data-ocid="admin_sales_metric"
      className="gap-3 rounded-lg border-border py-4 shadow-none"
    >
      <div className="flex items-center gap-3 px-4">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="truncate font-display text-xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

/** Top products ranked by units sold, derived from the catalogue. */
function topProducts(products: Product[], limit = 5): Product[] {
  return [...products]
    .sort((a, b) => {
      const aSold = toNumber(a.originalPrice) - toNumber(a.discountPrice);
      const bSold = toNumber(b.originalPrice) - toNumber(b.discountPrice);
      if (bSold !== aSold) return bSold - aSold;
      return toNumber(b.stockQuantity) - toNumber(a.stockQuantity);
    })
    .slice(0, limit);
}

function SalesContent() {
  const summaryQuery = useAdminSalesSummary();
  const productsQuery = useAdminProducts();

  const summary = summaryQuery.data;
  const products = productsQuery.data ?? [];

  const statusRows = useMemo(() => {
    const rows = summary?.ordersByStatus ?? [];
    const total = rows.reduce((sum, [, count]) => sum + toNumber(count), 0);
    return rows.map(([status, count]) => ({
      status,
      count: toNumber(count),
      share: total > 0 ? Math.round((toNumber(count) / total) * 100) : 0,
    }));
  }, [summary]);

  const ranked = useMemo(() => topProducts(products), [products]);

  return (
    <AdminQueryState
      isLoading={summaryQuery.isLoading || productsQuery.isLoading}
      isError={summaryQuery.isError || productsQuery.isError}
      onRetry={() => {
        void summaryQuery.refetch();
        void productsQuery.refetch();
      }}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Metric
            label="Total orders"
            value={toNumber(summary?.totalOrders ?? 0n).toLocaleString("en-IN")}
            icon={ShoppingBag}
            tone="primary"
          />
          <Metric
            label="Total revenue"
            value={formatPaise(summary?.totalRevenue ?? 0n)}
            icon={IndianRupee}
            tone="accent"
          />
          <Metric
            label="Products"
            value={toNumber(summary?.totalProducts ?? 0n).toLocaleString(
              "en-IN",
            )}
            icon={Package}
            tone="muted"
          />
          <Metric
            label="Customers"
            value={toNumber(summary?.totalCustomers ?? 0n).toLocaleString(
              "en-IN",
            )}
            icon={Users}
            tone="muted"
          />
        </div>

        <section aria-labelledby="admin-sales-status">
          <h2
            id="admin-sales-status"
            className="mb-2 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Orders by status
          </h2>
          {statusRows.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No orders to break down"
              message="Status totals appear once customers start ordering."
            />
          ) : (
            <ul className="space-y-2 rounded-lg border border-border bg-card p-4">
              {statusRows.map((row) => {
                const label =
                  ORDER_STATUS_LABELS[row.status as OrderStatus] ?? row.status;
                return (
                  <li
                    key={row.status}
                    data-ocid="admin_sales_status_row"
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{label}</span>
                      <span className="font-display font-semibold tabular-nums text-foreground">
                        {row.count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-smooth"
                        style={{ width: `${row.share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="admin-sales-top-products">
          <h2
            id="admin-sales-top-products"
            className="mb-2 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Top products
          </h2>
          {ranked.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              message="Add products to see your best performers here."
            />
          ) : (
            <ol className="space-y-2">
              {ranked.map((product, index) => (
                <li
                  key={product.id.toString()}
                  data-ocid={`admin_top_product_item.${index + 1}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.brand} · {product.packSize}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-sm font-bold tabular-nums text-foreground">
                      {formatPaise(product.discountPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {toNumber(product.stockQuantity)} in stock
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AdminQueryState>
  );
}

export function AdminSalesPage() {
  return (
    <Layout title="Sales summary">
      <AdminGuard>
        <SalesContent />
      </AdminGuard>
    </Layout>
  );
}
