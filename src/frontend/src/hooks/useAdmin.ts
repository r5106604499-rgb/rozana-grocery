import { createActor } from "@/backend";
import type { CategoryInput, CouponInput, ProductInput } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  Category,
  CategoryId,
  Coupon,
  CouponId,
  CustomerSummary,
  Order,
  OrderId,
  OrderStatus,
  Product,
  ProductId,
  SalesSummary,
} from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Every product in the catalogue, for the admin table. */
export function useAdminProducts(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts({ inStockOnly: false });
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Add a product to the catalogue. */
export function useAdminAddProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<ProductId, Error, ProductInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminAddProduct(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminProducts,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSales });
    },
  });
}

/** Update an existing product. */
export function useAdminUpdateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { productId: ProductId; input: ProductInput }
  >({
    mutationFn: async ({ productId, input }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminUpdateProduct(productId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminProducts,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },
  });
}

/** Delete a product from the catalogue. */
export function useAdminDeleteProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, ProductId>({
    mutationFn: async (productId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminDeleteProduct(productId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminProducts,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSales });
    },
  });
}

/** Set a product's stock quantity. */
export function useAdminSetStock() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { productId: ProductId; stockQuantity: bigint }
  >({
    mutationFn: async ({ productId, stockQuantity }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminSetStock(productId, stockQuantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminProducts,
      });
    },
  });
}

/** Add a category. */
export function useAdminAddCategory() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<CategoryId, Error, CategoryInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminAddCategory(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSales });
    },
  });
}

/** All coupons, including inactive ones. */
export function useAdminCoupons(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Coupon[]>({
    queryKey: QUERY_KEYS.adminCoupons,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListCoupons();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Add a coupon. */
export function useAdminAddCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<CouponId, Error, CouponInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminAddCoupon(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminCoupons });
    },
  });
}

/** Update a coupon. */
export function useAdminUpdateCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { couponId: CouponId; input: CouponInput }
  >({
    mutationFn: async ({ couponId, input }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminUpdateCoupon(couponId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminCoupons });
    },
  });
}

/** Delete a coupon. */
export function useAdminDeleteCoupon() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, CouponId>({
    mutationFn: async (couponId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminDeleteCoupon(couponId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminCoupons });
    },
  });
}

/** Every order across all customers, paired with the customer principal. */
export function useAdminOrders(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Array<[Principal, Order]>>({
    queryKey: QUERY_KEYS.adminOrders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListOrders();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Change an order's status. */
export function useAdminSetOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { customer: Principal; orderId: OrderId; status: OrderStatus }
  >({
    mutationFn: async ({ customer, orderId, status }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminSetOrderStatus(customer, orderId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOrders });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSales });
    },
  });
}

/** Customer summaries with order counts and lifetime spend. */
export function useAdminCustomers(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CustomerSummary[]>({
    queryKey: QUERY_KEYS.adminCustomers,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListCustomers();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** Aggregate sales figures for the dashboard and sales page. */
export function useAdminSalesSummary(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SalesSummary>({
    queryKey: QUERY_KEYS.adminSales,
    queryFn: async () => {
      if (!actor) {
        return {
          totalProducts: 0n,
          ordersByStatus: [],
          totalOrders: 0n,
          totalRevenue: 0n,
          totalCustomers: 0n,
        };
      }
      return actor.adminSalesSummary();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

/** All categories, reused by the admin category manager. */
export function useAdminCategories(enabled = true) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Category[]>({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}
