import { createActor } from "@/backend";
import type { CheckoutInput } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { Order, OrderId } from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The signed-in user's orders, newest first. */
export function useMyOrders(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: QUERY_KEYS.orders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyOrders();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** A single order belonging to the signed-in user. */
export function useMyOrder(orderId: OrderId | undefined, enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order | null>({
    queryKey: QUERY_KEYS.order(orderId ?? 0n),
    queryFn: async () => {
      if (!actor || orderId === undefined) return null;
      return actor.getMyOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== undefined && enabled,
  });
}

/** Place an order from the caller's cart. */
export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<OrderId, Error, CheckoutInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.placeOrder(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}
