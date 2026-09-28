import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  LayoutGrid,
  type LucideIcon,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
];

interface BottomNavProps {
  /** Cart item count shown on the Cart tab. */
  cartCount?: number;
  className?: string;
}

/** Fixed five-tab bottom navigation for the mobile storefront. */
export function BottomNav({ cartCount = 0, className }: BottomNavProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <nav
      data-ocid="bottom_nav"
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-nav-top",
        className,
      )}
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-between px-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                data-ocid={`nav_${item.label.toLowerCase()}_link`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 text-[11px] font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn("h-5 w-5", active && "stroke-[2.5]")}
                    aria-hidden="true"
                  />
                  {item.to === "/cart" && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
                {active ? (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
