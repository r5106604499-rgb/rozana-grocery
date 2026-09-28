import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { CartError, CartView, ProductId } from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's cart with totals and applied coupon. */
export function useCart() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CartView>({
    queryKey: QUERY_KEYS.cart,
    queryFn: async () => {
      if (!actor) {
        return {
          deliveryCharge: 0n,
          total: 0n,
          itemCount: 0n,
          couponDiscount: 0n,
          items: [],
          freeDeliveryThreshold: 0n,
          subtotal: 0n,
          discountTotal: 0n,
        };
      }
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Add a product to the cart. */
export function useAddToCart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    CartError,
    Error,
    { productId: ProductId; quantity: bigint }
  >({
    mutationFn: async ({ productId, quantity }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Set a cart line's quantity (0 removes it). */
export function useSetCartQuantity() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    CartError,
    Error,
    { productId: ProductId; quantity: bigint }
  >({
    mutationFn: async ({ productId, quantity }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setCartQuantity(productId, quantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Remove a product from the cart. */
export function useRemoveFromCart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, ProductId>({
    mutationFn: async (productId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Clear the entire cart. */
export function useClearCart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.clearCart();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Apply a coupon code to the cart. */
export function useApplyCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<CartError, Error, string>({
    mutationFn: async (code) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.applyCoupon(code);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Remove the applied coupon from the cart. */
export function useRemoveCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeCoupon();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}
