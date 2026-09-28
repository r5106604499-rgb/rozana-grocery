import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/app";
import { useNavigate } from "@tanstack/react-router";
import { Bell, BellRing, Check, LogIn } from "lucide-react";

interface NotificationRowProps {
  notification: Notification;
  busy: boolean;
  onMarkRead: (id: Notification["id"]) => void;
}

/** One notification with its read state and mark-as-read action. */
function NotificationRow({
  notification,
  busy,
  onMarkRead,
}: NotificationRowProps) {
  const unread = !notification.read;

  return (
    <article
      data-ocid="notification_item"
      className={cn(
        "rounded-xl border bg-card p-4 shadow-subtle transition-smooth",
        unread ? "border-primary/40" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            unread
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground",
          )}
        >
          {unread ? (
            <BellRing className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bell className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm text-foreground",
                unread ? "font-bold" : "font-medium",
              )}
            >
              {notification.title}
            </p>
            {unread ? (
              <span
                data-ocid="notification_unread_dot"
                aria-label="Unread"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
              />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {notification.body}
          </p>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {formatRelative(notification.createdAt)}
          </p>
        </div>
      </div>

      {unread ? (
        <div className="mt-3 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="notification_mark_read_button"
            disabled={busy}
            onClick={() => onMarkRead(notification.id)}
            className="gap-1.5 rounded-full"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Mark as read
          </Button>
        </div>
      ) : null}
    </article>
  );
}

/** The signed-in user's notifications with read/unread state. */
export function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const notificationsQuery = useNotifications(isAuthenticated);
  const markRead = useMarkNotificationRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  if (isInitializing) {
    return (
      <Layout title="Notifications">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout title="Notifications">
        <EmptyState
          icon={LogIn}
          title="Sign in to see notifications"
          message="Log in with Internet Identity to get order updates and offers."
        >
          <Button
            type="button"
            data-ocid="notifications_login_button"
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

  if (notificationsQuery.isError) {
    return (
      <Layout title="Notifications">
        <ErrorState
          title="Couldn't load notifications"
          message="We couldn't fetch your updates. Please try again."
          onRetry={() => void notificationsQuery.refetch()}
        />
      </Layout>
    );
  }

  if (notificationsQuery.isLoading) {
    return (
      <Layout title="Notifications">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (notifications.length === 0) {
    return (
      <Layout title="Notifications">
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="Order updates and offers will appear here."
          actionLabel="Start shopping"
          onAction={() => void navigate({ to: "/" })}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Notifications">
      <div data-ocid="notifications_page" className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </p>

        {markRead.isError ? (
          <p
            data-ocid="notification_error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            We couldn&apos;t update that notification. Please try again.
          </p>
        ) : null}

        <div data-ocid="notifications_list" className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id.toString()}
              notification={notification}
              busy={markRead.isPending}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
