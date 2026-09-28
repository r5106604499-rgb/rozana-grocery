import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { useAddresses } from "@/hooks/useAddress";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { APP_NAME } from "@/lib/constants";
import { toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  /** Hide the storefront header (used by focused flows like checkout). */
  hideHeader?: boolean;
  /** Hide the bottom navigation (used by focused flows like checkout). */
  hideNav?: boolean;
  /** Optional page title rendered above the content. */
  title?: string;
  className?: string;
}

/** Shared app shell: sticky header, scrollable content, bottom navigation. */
export function Layout({
  children,
  hideHeader = false,
  hideNav = false,
  title,
  className,
}: LayoutProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: cart } = useCart();
  const { data: addresses } = useAddresses();

  const cartCount = cart ? toNumber(cart.itemCount) : 0;
  const defaultAddress = addresses?.[0]?.address;
  const addressLabel = defaultAddress
    ? [defaultAddress.area, defaultAddress.pincode].filter(Boolean).join(", ")
    : undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {!hideHeader ? (
        <Header
          cartCount={cartCount}
          addressLabel={addressLabel}
          isAuthenticated={isAuthenticated}
          onAddressClick={() => void navigate({ to: "/addresses" })}
        />
      ) : null}

      <main
        data-ocid="page"
        className={cn(
          "mx-auto w-full max-w-md flex-1 px-4 py-4",
          !hideNav && "pb-24",
          className,
        )}
      >
        {title ? (
          <h1 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        ) : null}
        {children}
      </main>

      <footer className="mx-auto w-full max-w-md px-4 pb-24 pt-2 text-center">
        <p className="text-[11px] text-muted-foreground">
          {APP_NAME} ·{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </a>
        </p>
      </footer>

      {!hideNav ? <BottomNav cartCount={cartCount} /> : null}
    </div>
  );
}
