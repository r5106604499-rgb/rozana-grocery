import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { Coupon } from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/** Active coupons available to shoppers (public, non-admin-gated). */
export function useCoupons() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Coupon[]>({
    queryKey: QUERY_KEYS.activeCoupons,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}
