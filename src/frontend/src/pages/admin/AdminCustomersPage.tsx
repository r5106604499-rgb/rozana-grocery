import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { useAdminCustomers } from "@/hooks/useAdmin";
import { formatPaise, initials, toNumber } from "@/lib/format";
import { Users } from "lucide-react";

function CustomersContent() {
  const customersQuery = useAdminCustomers();
  const customers = customersQuery.data ?? [];

  return (
    <AdminQueryState
      isLoading={customersQuery.isLoading}
      isError={customersQuery.isError}
      onRetry={() => void customersQuery.refetch()}
    >
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          message="Shoppers appear here once they place their first order."
        />
      ) : (
        <ul className="space-y-2">
          {customers.map((customer, index) => (
            <li
              key={customer.principal.toText()}
              data-ocid={`admin_customer_item.${index + 1}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
                {initials(customer.name || "Guest")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-foreground">
                  {customer.name || "Guest shopper"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {customer.email ?? "No email on file"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-sm font-bold tabular-nums text-foreground">
                  {formatPaise(customer.totalSpent)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {toNumber(customer.orderCount)}{" "}
                  {toNumber(customer.orderCount) === 1 ? "order" : "orders"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminQueryState>
  );
}

export function AdminCustomersPage() {
  return (
    <Layout title="Customers">
      <AdminGuard>
        <CustomersContent />
      </AdminGuard>
    </Layout>
  );
}
