import type { backendInterface } from "@/backend";
import type {
  Address,
  CartView,
  Category,
  HomeFeed,
  Order,
  Product,
} from "@/types/app";
import { OrderStatus, PaymentMethod, UserRole } from "@/types/app";
import { vi } from "vitest";

/**
 * A typed stand-in for the generated backend actor. Every method the storefront
 * calls is present so a test can override only the ones it exercises; the rest
 * resolve to a benign empty value. This is a local mock — it proves nothing
 * about the real canister, which the PocketIC lane covers separately.
 *
 * Each property keeps the real method signature rather than `Mock<Procedure>`,
 * so an override may be either a plain async function or a `vi.fn()` spy and
 * still satisfy the mocked `useActor` contract.
 */
export type ActorMock = {
  [K in keyof backendInterface]: backendInterface[K];
};

/** Mutable holder the mocked `useActor` reads, so a test can swap the actor. */
export const actorState: { actor: ActorMock | null; isFetching: boolean } = {
  actor: null,
  isFetching: false,
};

/** Mutable Internet Identity state the mocked `useInternetIdentity` reads. */
export const identityState: {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
} = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  logout: vi.fn(),
};

/** Reset the shared mock state between tests. */
export function resetHarness(): void {
  actorState.actor = null;
  actorState.isFetching = false;
  identityState.isAuthenticated = false;
  identityState.isInitializing = false;
  identityState.isLoggingIn = false;
  identityState.login = vi.fn();
  identityState.logout = vi.fn();
}

/** Build a fully-typed actor mock with benign defaults. */
export function createActorMock(overrides: Partial<ActorMock> = {}): ActorMock {
  const emptyCart: CartView = {
    deliveryCharge: 0n,
    total: 0n,
    itemCount: 0n,
    couponDiscount: 0n,
    items: [],
    freeDeliveryThreshold: 0n,
    subtotal: 0n,
    discountTotal: 0n,
  };
  const emptyFeed: HomeFeed = {
    bestSelling: [],
    recommended: [],
    discounted: [],
    newArrivals: [],
    todaysDeals: [],
  };
  const base: ActorMock = {
    _initialize_access_control: vi.fn(async () => undefined),
    _internet_identity_sign_in_finish: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    })),
    _internet_identity_sign_in_start: vi.fn(async () => new Uint8Array()),
    addAddress: vi.fn(async () => 1n),
    addToCart: vi.fn(async () => ({
      __kind__: "invalidQuantity" as const,
      invalidQuantity: null,
    })),
    adminAddCategory: vi.fn(async () => 1n),
    adminAddCoupon: vi.fn(async () => 1n),
    adminAddProduct: vi.fn(async () => 1n),
    adminDeleteCoupon: vi.fn(async () => true),
    adminDeleteProduct: vi.fn(async () => true),
    adminListCoupons: vi.fn(async () => []),
    adminListCustomers: vi.fn(async () => []),
    adminListOrders: vi.fn(async () => []),
    adminSalesSummary: vi.fn(async () => ({
      totalProducts: 0n,
      ordersByStatus: [],
      totalOrders: 0n,
      totalRevenue: 0n,
      totalCustomers: 0n,
    })),
    adminSetOrderStatus: vi.fn(async () => true),
    adminSetStock: vi.fn(async () => true),
    adminUpdateCoupon: vi.fn(async () => true),
    adminUpdateProduct: vi.fn(async () => true),
    applyCoupon: vi.fn(async () => ({
      __kind__: "invalidQuantity" as const,
      invalidQuantity: null,
    })),
    assignCallerUserRole: vi.fn(async () => undefined),
    clearCart: vi.fn(async () => undefined),
    deleteAddress: vi.fn(async () => true),
    execute: vi.fn(async () => ({ hasMore: false, rows: [] })),
    getApiDoc: vi.fn(async () => ""),
    getCallerEmail: vi.fn(async () => null),
    getCallerUserProfile: vi.fn(async () => null),
    getCallerUserRole: vi.fn(async () => UserRole.guest),
    getCart: vi.fn(async () => emptyCart),
    getCategory: vi.fn(async () => null),
    getHomeFeeds: vi.fn(async () => emptyFeed),
    getMyOrder: vi.fn(async () => null),
    getProduct: vi.fn(async () => null),
    isCallerAdmin: vi.fn(async () => false),
    listActiveCoupons: vi.fn(async () => []),
    listAddresses: vi.fn(async () => []),
    listCategories: vi.fn(async () => []),
    listMyOrders: vi.fn(async () => []),
    listNotifications: vi.fn(async () => []),
    listProductsByCategory: vi.fn(async () => []),
    listRecentlyViewed: vi.fn(async () => []),
    listWishlist: vi.fn(async () => []),
    markNotificationRead: vi.fn(async () => true),
    placeOrder: vi.fn(async () => 1n),
    recordRecentlyViewed: vi.fn(async () => undefined),
    removeCoupon: vi.fn(async () => undefined),
    removeFromCart: vi.fn(async () => true),
    saveCallerUserProfile: vi.fn(async () => undefined),
    schema: vi.fn(async () => ""),
    searchProducts: vi.fn(async () => []),
    setCartQuantity: vi.fn(async () => ({
      __kind__: "invalidQuantity" as const,
      invalidQuantity: null,
    })),
    toggleWishlist: vi.fn(async () => true),
    updateAddress: vi.fn(async () => true),
  };
  return { ...base, ...overrides };
}

/** A realistic grocery product fixture. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1n,
    categoryId: 1n,
    stockQuantity: 50n,
    inStock: true,
    originalPrice: 12000n,
    packSize: "5 kg",
    name: "India Gate Basmati Rice",
    createdAt: 1_700_000_000_000_000_000n,
    description: "Long-grain aged basmati rice.",
    discountPercent: 25n,
    imageUrl: "https://example.test/rice.png",
    discountPrice: 9000n,
    brand: "India Gate",
    ...overrides,
  };
}

/** A realistic category fixture. */
export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1n,
    name: "Rice & Atta",
    productCount: 12n,
    imageUrl: "https://example.test/cat.png",
    ...overrides,
  };
}

/** A realistic delivery address fixture. */
export function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    fullName: "Ananya Sharma",
    mobile: "9876543210",
    houseFlat: "Flat 4B",
    area: "Indiranagar",
    landmark: "Near Metro Station",
    pincode: "560038",
    instructions: "",
    ...overrides,
  };
}

/** A realistic order fixture. */
export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 42n,
    status: OrderStatus.placed,
    deliveryCharge: 0n,
    total: 9000n,
    paymentMethod: PaymentMethod.cod,
    lines: [
      {
        originalUnitPrice: 12000n,
        packSize: "5 kg",
        name: "India Gate Basmati Rice",
        lineTotal: 9000n,
        productId: 1n,
        imageUrl: "https://example.test/rice.png",
        quantity: 1n,
        brand: "India Gate",
        unitPrice: 9000n,
      },
    ],
    couponDiscount: 0n,
    updatedAt: 1_700_000_000_000_000_000n,
    address: makeAddress(),
    placedAt: 1_700_000_000_000_000_000n,
    subtotal: 9000n,
    discountTotal: 3000n,
    ...overrides,
  };
}

/** A cart view with one line, used by cart/checkout journeys. */
export function makeCart(overrides: Partial<CartView> = {}): CartView {
  return {
    deliveryCharge: 2900n,
    total: 11900n,
    itemCount: 1n,
    couponDiscount: 0n,
    items: [
      {
        inStock: true,
        originalUnitPrice: 12000n,
        packSize: "5 kg",
        name: "India Gate Basmati Rice",
        lineTotal: 9000n,
        productId: 1n,
        imageUrl: "https://example.test/rice.png",
        quantity: 1n,
        brand: "India Gate",
        unitPrice: 9000n,
      },
    ],
    freeDeliveryThreshold: 49900n,
    subtotal: 9000n,
    discountTotal: 3000n,
    ...overrides,
  };
}
