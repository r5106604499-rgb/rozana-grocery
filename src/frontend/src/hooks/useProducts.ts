import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  Category,
  CategoryId,
  HomeFeed,
  Product,
  ProductFilter,
  ProductId,
} from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** All grocery categories with product counts. */
export function useCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Category[]>({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single category by id. */
export function useCategory(categoryId: CategoryId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Category | null>({
    queryKey: QUERY_KEYS.category(categoryId ?? 0n),
    queryFn: async () => {
      if (!actor || categoryId === undefined) return null;
      return actor.getCategory(categoryId);
    },
    enabled: !!actor && !isFetching && categoryId !== undefined,
  });
}

/** Products within a category. */
export function useProductsByCategory(categoryId: CategoryId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.productsByCategory(categoryId ?? 0n),
    queryFn: async () => {
      if (!actor || categoryId === undefined) return [];
      return actor.listProductsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && categoryId !== undefined,
  });
}

/** A single product's detail. */
export function useProduct(productId: ProductId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product | null>({
    queryKey: QUERY_KEYS.product(productId ?? 0n),
    queryFn: async () => {
      if (!actor || productId === undefined) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== undefined,
  });
}

/** Search and filter products. */
export function useSearchProducts(filter: ProductFilter, enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  const term = filter.searchTerm?.trim() ?? "";
  const categoryKey = filter.categoryId?.toString() ?? "";
  const minKey = filter.minPrice?.toString() ?? "";
  const maxKey = filter.maxPrice?.toString() ?? "";
  return useQuery<Product[]>({
    queryKey: [
      ...QUERY_KEYS.search(term),
      categoryKey,
      minKey,
      maxKey,
      filter.inStockOnly,
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(filter);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Home screen feeds: deals, best selling, new arrivals, discounted, recommended. */
export function useHomeFeeds() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<HomeFeed>({
    queryKey: QUERY_KEYS.homeFeeds,
    queryFn: async () => {
      if (!actor) {
        return {
          bestSelling: [],
          recommended: [],
          discounted: [],
          newArrivals: [],
          todaysDeals: [],
        };
      }
      return actor.getHomeFeeds();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Recently viewed product ids for the caller. */
export function useRecentlyViewed() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProductId[]>({
    queryKey: QUERY_KEYS.recentlyViewed,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRecentlyViewed();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Record a product as recently viewed. */
export function useRecordRecentlyViewed() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordRecentlyViewed(productId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.recentlyViewed,
      });
    },
  });
}
