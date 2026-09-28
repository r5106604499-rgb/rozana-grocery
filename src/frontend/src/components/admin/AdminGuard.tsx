import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Gates admin content behind sign-in and the admin role.
 * Signed-out users get a sign-in prompt; signed-in non-admins get access denied.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isInitializing, isLoggingIn, login } =
    useAuth();

  if (isInitializing) {
    return <LoadingState rows={3} />;
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Admin sign-in required"
        message="Sign in with an administrator account to manage the store."
      >
        <Button
          type="button"
          data-ocid="admin_signin_button"
          disabled={isLoggingIn}
          onClick={() => void login()}
          className="mt-1"
        >
          {isLoggingIn ? "Signing in…" : "Sign in"}
        </Button>
      </EmptyState>
    );
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Access denied"
        message="This area is restricted to store administrators. Your account does not have admin access."
      />
    );
  }

  return <>{children}</>;
}

interface AdminQueryStateProps {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: ReactNode;
}

/** Renders loading and error states around an admin query result. */
export function AdminQueryState({
  isLoading,
  isError,
  onRetry,
  children,
}: AdminQueryStateProps) {
  if (isLoading) return <LoadingState rows={4} />;
  if (isError) {
    return (
      <ErrorState
        title="Couldn't load admin data"
        message="We couldn't reach the store backend. Please try again."
        onRetry={onRetry}
      />
    );
  }
  return <>{children}</>;
}
