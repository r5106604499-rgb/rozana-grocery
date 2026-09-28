import { Button } from "@/components/ui/button";
import { APP_NAME, DELIVERY_PROMISE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, MapPin, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  /** Cart item count for the badge. */
  cartCount?: number;
  /** Unread notification count for the badge. */
  notificationCount?: number;
  /** Delivery address label, e.g. "Andheri West, Mumbai". */
  addressLabel?: string;
  /** Whether the user is signed in. */
  isAuthenticated?: boolean;
  /** Called when the user taps the address row. */
  onAddressClick?: () => void;
  className?: string;
}

/** Sticky storefront header with address, search and cart badge. */
export function Header({
  cartCount = 0,
  notificationCount = 0,
  addressLabel,
  isAuthenticated = false,
  onAddressClick,
  className,
}: HeaderProps) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    void navigate({ to: "/search", search: { q: query } });
  };

  return (
    <header
      data-ocid="app_header"
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-card shadow-subtle",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-md px-4 pb-3 pt-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            data-ocid="delivery_address_button"
            onClick={onAddressClick}
            className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Deliver to
              </span>
              <span className="block truncate text-sm font-semibold text-foreground">
                {addressLabel ?? "Set your address"}
              </span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              asChild
              className="relative h-9 w-9 rounded-full"
            >
              <Link
                to="/notifications"
                aria-label="Notifications"
                data-ocid="notifications_link"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {notificationCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              asChild
              className="relative h-9 w-9 rounded-full"
            >
              <Link to="/cart" aria-label="Cart" data-ocid="cart_link">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartCount > 0 ? (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            {!isAuthenticated ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 rounded-full"
              >
                <Link
                  to="/profile"
                  aria-label="Sign in"
                  data-ocid="profile_link"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <form onSubmit={submitSearch} className="mt-3">
          <div className="flex items-center gap-2 rounded-full border border-input bg-background py-1 pl-4 pr-1 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search for rice, atta, biscuits..."
              aria-label="Search products"
              data-ocid="search_input"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
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

        <p className="mt-2 text-center text-[11px] font-medium text-primary">
          {DELIVERY_PROMISE} · {APP_NAME}
        </p>
      </div>
    </header>
  );
}
