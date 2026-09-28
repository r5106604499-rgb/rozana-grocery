/** App identity. */
export const APP_NAME = "Rozana Grocery";
export const APP_TAGLINE = "Daily essentials, delivered fresh";

/** Delivery promise copy shown in the header. */
export const DELIVERY_PROMISE = "Delivery in 30 minutes";

/** Query keys — one place so invalidation never drifts. */
export const QUERY_KEYS = {
  categories: ["categories"] as const,
  category: (id: bigint) => ["category", id.toString()] as const,
  productsByCategory: (id: bigint) =>
    ["products", "category", id.toString()] as const,
  product: (id: bigint) => ["product", id.toString()] as const,
  search: (term: string) => ["products", "search", term] as const,
  homeFeeds: ["home-feeds"] as const,
  recentlyViewed: ["recently-viewed"] as const,
  cart: ["cart"] as const,
  wishlist: ["wishlist"] as const,
  addresses: ["addresses"] as const,
  orders: ["orders"] as const,
  order: (id: bigint) => ["order", id.toString()] as const,
  notifications: ["notifications"] as const,
  profile: ["profile"] as const,
  callerEmail: ["caller-email"] as const,
  userRole: ["user-role"] as const,
  isAdmin: ["is-admin"] as const,
  activeCoupons: ["coupons", "active"] as const,
  adminProducts: ["admin", "products"] as const,
  adminCoupons: ["admin", "coupons"] as const,
  adminOrders: ["admin", "orders"] as const,
  adminCustomers: ["admin", "customers"] as const,
  adminSales: ["admin", "sales"] as const,
} as const;

/** Bottom navigation destinations. */
export const BOTTOM_NAV_ITEMS = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/categories", label: "Categories", icon: "categories" },
  { to: "/cart", label: "Cart", icon: "cart" },
  { to: "/orders", label: "Orders", icon: "orders" },
  { to: "/profile", label: "Profile", icon: "profile" },
] as const;

/** Free-delivery threshold fallback in paise (₹499). */
export const FREE_DELIVERY_THRESHOLD_PAISE = 49900n;

/** Standard delivery charge fallback in paise (₹29). */
export const DELIVERY_CHARGE_PAISE = 2900n;

/** Low-stock threshold used for stock badges. */
export const LOW_STOCK_THRESHOLD = 5n;
