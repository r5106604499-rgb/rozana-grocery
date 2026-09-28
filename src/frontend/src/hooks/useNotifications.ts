import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { Notification, NotificationId } from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The signed-in user's notifications, newest first. */
export function useNotifications(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Notification[]>({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotifications();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Mark a single notification as read. */
export function useMarkNotificationRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, NotificationId>({
    mutationFn: async (notificationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.notifications,
      });
    },
  });
}
