import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAuth,
  useCallerEmail,
  useSaveUserProfile,
  useUserProfile,
} from "@/hooks/useAuth";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgePercent,
  Bell,
  ChevronRight,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MenuItem {
  to: string;
  label: string;
  description: string;
  icon: typeof Package;
}

const MENU_ITEMS: MenuItem[] = [
  {
    to: "/orders",
    label: "My Orders",
    description: "Track and reorder your purchases",
    icon: Package,
  },
  {
    to: "/addresses",
    label: "Saved Addresses",
    description: "Manage delivery locations",
    icon: MapPin,
  },
  {
    to: "/wishlist",
    label: "Wishlist",
    description: "Products you saved for later",
    icon: Heart,
  },
  {
    to: "/cart",
    label: "Cart",
    description: "Review items before checkout",
    icon: ShoppingCart,
  },
  {
    to: "/coupons",
    label: "Coupons",
    description: "Offers and discount codes",
    icon: BadgePercent,
  },
  {
    to: "/notifications",
    label: "Notifications",
    description: "Order updates and offers",
    icon: Bell,
  },
  {
    to: "/help",
    label: "Help & Support",
    description: "FAQs and contact details",
    icon: HelpCircle,
  },
];

const ADMIN_MENU_ITEM: MenuItem = {
  to: "/admin",
  label: "Admin Panel",
  description: "Manage products, orders and sales",
  icon: LayoutDashboard,
};

/** Account hub: identity, editable name, verified email and quick links. */
export function ProfilePage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isInitializing,
    login,
    isLoggingIn,
    logout,
    isAdmin,
  } = useAuth();
  const profileQuery = useUserProfile();
  const emailQuery = useCallerEmail();
  const saveProfile = useSaveUserProfile();

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  if (isInitializing) {
    return (
      <Layout title="My Profile">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout title="My Profile">
        <EmptyState
          icon={LogIn}
          title="Sign in to your account"
          message="Log in with Internet Identity to manage your profile, addresses, wishlist and orders."
        >
          <Button
            type="button"
            data-ocid="profile_login_button"
            disabled={isLoggingIn}
            onClick={() => void login()}
            className="mt-1 gap-2 rounded-full"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {isLoggingIn ? "Signing in…" : "Sign in"}
          </Button>
        </EmptyState>
      </Layout>
    );
  }

  if (profileQuery.isError) {
    return (
      <Layout title="My Profile">
        <ErrorState
          title="Couldn't load your profile"
          message="We couldn't fetch your account details. Please try again."
          onRetry={() => void profileQuery.refetch()}
        />
      </Layout>
    );
  }

  const email = emailQuery.data ?? profile?.email;
  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && trimmedName !== profile?.name;

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    const nextName = trimmedName;
    saveProfile.mutate(
      { name: nextName, email: profile?.email },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 4000);
        },
      },
    );
  };

  return (
    <Layout title="My Profile">
      <div data-ocid="profile_page" className="space-y-5">
        {/* Identity card */}
        <section
          data-ocid="profile_identity_card"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-display text-lg font-bold text-primary-foreground">
            {initials(trimmedName || "Guest")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold text-foreground">
              {trimmedName || "Add your name"}
            </p>
            {email ? (
              <p
                data-ocid="profile_email"
                className="truncate text-sm text-muted-foreground"
              >
                {email}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No verified email on file
              </p>
            )}
          </div>
        </section>

        {/* Editable name */}
        <section
          data-ocid="profile_name_section"
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <h2 className="font-display text-sm font-bold text-foreground">
            Your name
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This is how we greet you across the app.
          </p>
          <form onSubmit={handleSave} className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                data-ocid="profile_name_input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                maxLength={60}
              />
            </div>
            {saveProfile.isError ? (
              <p
                data-ocid="profile_name_error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                We couldn&apos;t save your name. Please try again.
              </p>
            ) : null}
            {saved ? (
              <output
                data-ocid="profile_name_success"
                className="block text-xs font-medium text-savings"
              >
                Name saved.
              </output>
            ) : null}
            <Button
              type="submit"
              data-ocid="profile_save_button"
              disabled={!canSave || saveProfile.isPending}
              className="w-full rounded-full"
            >
              {saveProfile.isPending ? "Saving…" : "Save name"}
            </Button>
          </form>
        </section>

        {/* Account menu */}
        <nav data-ocid="profile_menu" aria-label="Account">
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
            {(isAdmin ? [...MENU_ITEMS, ADMIN_MENU_ITEM] : MENU_ITEMS).map(
              (item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.to}
                    className="border-b border-border last:border-b-0"
                  >
                    <Link
                      to={item.to}
                      data-ocid={`profile_menu_${item.label
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "_")}_link`}
                      className="flex items-center gap-3 px-4 py-3 transition-smooth hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </nav>

        {/* Logout */}
        <Button
          type="button"
          variant="outline"
          data-ocid="profile_logout_button"
          onClick={() => {
            logout();
            void navigate({ to: "/" });
          }}
          className={cn(
            "w-full gap-2 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <User className="h-3.5 w-3.5" aria-hidden="true" />
          Signed in with Internet Identity
        </p>
      </div>
    </Layout>
  );
}
