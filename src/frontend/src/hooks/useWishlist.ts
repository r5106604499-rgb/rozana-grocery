import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { ProductId } from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's wishlist product ids. */
export function useWishlist() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProductId[]>({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listWishlist();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Toggle a product in the wishlist. Returns true when now present. */
export function useToggleWishlist() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, ProductId>({
    mutationFn: async (productId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.toggleWishlist(productId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist });
    },
  });
}

/** Convenience predicate for a single product id. */
export function useIsWishlisted(productId: ProductId | undefined): boolean {
  const { data } = useWishlist();
  if (productId === undefined || !data) return false;
  return data.some((id) => id === productId);
}
