import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { Card } from "@/components/ui/card";
import { useAdminSalesSummary } from "@/hooks/useAdmin";
import { formatPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BadgePercent,
  ChevronRight,
  IndianRupee,
  LayoutGrid,
  Package,
  ShoppingBag,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
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

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <Card
      data-ocid="admin_stat_card"
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

const QUICK_LINKS = [
  {
    to: "/admin/products",
    label: "Products",
    description: "Add, edit and manage stock",
    icon: Package,
  },
  {
    to: "/admin/categories",
    label: "Categories",
    description: "Organise the catalogue",
    icon: LayoutGrid,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    description: "Track and update statuses",
    icon: ShoppingBag,
  },
  {
    to: "/admin/coupons",
    label: "Coupons",
    description: "Create discount offers",
    icon: BadgePercent,
  },
  {
    to: "/admin/customers",
    label: "Customers",
    description: "View shoppers and spend",
    icon: Users,
  },
  {
    to: "/admin/sales",
    label: "Sales",
    description: "Revenue and top products",
    icon: TrendingUp,
  },
] as const;

function DashboardContent() {
  const summary = useAdminSalesSummary();

  return (
    <AdminQueryState
      isLoading={summary.isLoading}
      isError={summary.isError}
      onRetry={() => void summary.refetch()}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total orders"
            value={toNumber(summary.data?.totalOrders ?? 0n).toLocaleString(
              "en-IN",
            )}
            icon={ShoppingBag}
            tone="primary"
          />
          <StatCard
            label="Revenue"
            value={formatPaise(summary.data?.totalRevenue ?? 0n)}
            icon={IndianRupee}
            tone="accent"
          />
          <StatCard
            label="Products"
            value={toNumber(summary.data?.totalProducts ?? 0n).toLocaleString(
              "en-IN",
            )}
            icon={Package}
            tone="muted"
          />
          <StatCard
            label="Customers"
            value={toNumber(summary.data?.totalCustomers ?? 0n).toLocaleString(
              "en-IN",
            )}
            icon={Users}
            tone="muted"
          />
        </div>

        <section aria-labelledby="admin-quick-links">
          <h2
            id="admin-quick-links"
            className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Manage store
          </h2>
          <div className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid="admin_quick_link"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-smooth hover:border-primary/40 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <link.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-semibold text-foreground">
                    {link.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {link.description}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        <p className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          <Tags className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          All admin actions are verified against your administrator role.
        </p>
      </div>
    </AdminQueryState>
  );
}

export function AdminDashboardPage() {
  return (
    <Layout title="Admin dashboard">
      <AdminGuard>
        <DashboardContent />
      </AdminGuard>
    </Layout>
  );
}
