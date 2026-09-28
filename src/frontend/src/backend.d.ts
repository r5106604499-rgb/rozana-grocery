import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Address {
    area: string;
    fullName: string;
    instructions: string;
    landmark: string;
    mobile: string;
    pincode: string;
    houseFlat: string;
}
export type AddressId = bigint;
export type CartError = {
    __kind__: "productNotFound";
    productNotFound: ProductId;
} | {
    __kind__: "couponInactive";
    couponInactive: string;
} | {
    __kind__: "invalidAddress";
    invalidAddress: string;
} | {
    __kind__: "couponNotFound";
    couponNotFound: string;
} | {
    __kind__: "outOfStock";
    outOfStock: ProductId;
} | {
    __kind__: "invalidPincode";
    invalidPincode: string;
} | {
    __kind__: "couponMinOrderNotMet";
    couponMinOrderNotMet: {
        actual: Paise;
        required: Paise;
    };
} | {
    __kind__: "invalidMobile";
    invalidMobile: string;
} | {
    __kind__: "invalidQuantity";
    invalidQuantity: null;
} | {
    __kind__: "emptyCart";
    emptyCart: null;
};
export interface CartItemView {
    inStock: boolean;
    originalUnitPrice: Paise;
    packSize: PackSize;
    name: string;
    lineTotal: Paise;
    productId: ProductId;
    imageUrl: string;
    quantity: bigint;
    brand: string;
    unitPrice: Paise;
}
export interface CartView {
    couponCode?: string;
    deliveryCharge: Paise;
    total: Paise;
    itemCount: bigint;
    couponDiscount: Paise;
    items: Array<CartItemView>;
    freeDeliveryThreshold: Paise;
    subtotal: Paise;
    discountTotal: Paise;
}
export interface Category {
    id: CategoryId;
    name: string;
    productCount: bigint;
    imageUrl: string;
}
export type CategoryId = bigint;
export interface CategoryInput {
    name: string;
    imageUrl: string;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface CheckoutInput {
    couponCode?: string;
    paymentMethod: PaymentMethod;
    address: Address;
}
export interface Coupon {
    id: CouponId;
    active: boolean;
    maxDiscount: Paise;
    code: string;
    description: string;
    discountPercent: bigint;
    minOrderValue: Paise;
}
export type CouponId = bigint;
export interface CouponInput {
    active: boolean;
    maxDiscount: Paise;
    code: string;
    description: string;
    discountPercent: bigint;
    minOrderValue: Paise;
}
export interface CustomerSummary {
    principal: Principal;
    name: string;
    email?: string;
    orderCount: bigint;
    totalSpent: Paise;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface HomeFeed {
    bestSelling: Array<Product>;
    recommended: Array<Product>;
    discounted: Array<Product>;
    newArrivals: Array<Product>;
    todaysDeals: Array<Product>;
}
export interface Notification {
    id: NotificationId;
    title: string;
    body: string;
    createdAt: Timestamp;
    read: boolean;
}
export type NotificationId = bigint;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    couponCode?: string;
    deliveryCharge: Paise;
    total: Paise;
    paymentMethod: PaymentMethod;
    lines: Array<OrderLine>;
    couponDiscount: Paise;
    updatedAt: Timestamp;
    address: Address;
    placedAt: Timestamp;
    subtotal: Paise;
    discountTotal: Paise;
}
export type OrderId = bigint;
export interface OrderLine {
    originalUnitPrice: Paise;
    packSize: PackSize;
    name: string;
    lineTotal: Paise;
    productId: ProductId;
    imageUrl: string;
    quantity: bigint;
    brand: string;
    unitPrice: Paise;
}
export type PackSize = string;
export type Paise = bigint;
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    stockQuantity: bigint;
    inStock: boolean;
    originalPrice: Paise;
    packSize: PackSize;
    name: string;
    createdAt: Timestamp;
    description: string;
    discountPercent: bigint;
    imageUrl: string;
    discountPrice: Paise;
    brand: string;
}
export interface ProductFilter {
    categoryId?: CategoryId;
    inStockOnly: boolean;
    maxPrice?: Paise;
    searchTerm?: string;
    minPrice?: Paise;
}
export type ProductId = bigint;
export interface ProductInput {
    categoryId: CategoryId;
    stockQuantity: bigint;
    originalPrice: Paise;
    packSize: PackSize;
    name: string;
    description: string;
    imageUrl: string;
    discountPrice: Paise;
    brand: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SalesSummary {
    totalProducts: bigint;
    ordersByStatus: Array<[string, bigint]>;
    totalOrders: bigint;
    totalRevenue: Paise;
    totalCustomers: bigint;
}
export interface SavedAddress {
    id: AddressId;
    address: Address;
}
export type Timestamp = bigint;
export interface UserProfile {
    name: string;
    email?: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum OrderStatus {
    outForDelivery = "outForDelivery",
    placed = "placed",
    packing = "packing",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    cod = "cod",
    online = "online"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add a saved address.
     */
    addAddress(address: Address): Promise<AddressId>;
    /**
     * / Add a product to the caller's cart.
     */
    addToCart(productId: ProductId, quantity: bigint): Promise<CartError>;
    /**
     * / Add a category (admin only).
     */
    adminAddCategory(input: CategoryInput): Promise<CategoryId>;
    /**
     * / Add a coupon (admin only).
     */
    adminAddCoupon(input: CouponInput): Promise<CouponId>;
    /**
     * / Add a product (admin only).
     */
    adminAddProduct(input: ProductInput): Promise<ProductId>;
    /**
     * / Delete a coupon (admin only).
     */
    adminDeleteCoupon(couponId: CouponId): Promise<boolean>;
    /**
     * / Delete a product (admin only).
     */
    adminDeleteProduct(productId: ProductId): Promise<boolean>;
    /**
     * / List all coupons (admin only).
     */
    adminListCoupons(): Promise<Array<Coupon>>;
    /**
     * / List customer summaries (admin only).
     */
    adminListCustomers(): Promise<Array<CustomerSummary>>;
    /**
     * / List all orders across customers (admin only).
     */
    adminListOrders(): Promise<Array<[Principal, Order]>>;
    /**
     * / Aggregate sales figures (admin only).
     */
    adminSalesSummary(): Promise<SalesSummary>;
    /**
     * / Change an order's status (admin only).
     */
    adminSetOrderStatus(customer: Principal, orderId: OrderId, status: OrderStatus): Promise<boolean>;
    /**
     * / Set a product's stock quantity (admin only).
     */
    adminSetStock(productId: ProductId, stockQuantity: bigint): Promise<boolean>;
    /**
     * / Update a coupon (admin only).
     */
    adminUpdateCoupon(couponId: CouponId, input: CouponInput): Promise<boolean>;
    /**
     * / Update a product (admin only).
     */
    adminUpdateProduct(productId: ProductId, input: ProductInput): Promise<boolean>;
    /**
     * / Apply a coupon code to the caller's cart.
     */
    applyCoupon(code: string): Promise<CartError>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Clear the caller's cart.
     */
    clearCart(): Promise<void>;
    /**
     * / Delete a saved address.
     */
    deleteAddress(addressId: AddressId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the backend's behavioral API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    /**
     * / Get the caller's verified email, when available.
     */
    getCallerEmail(): Promise<string | null>;
    /**
     * / Get the caller's profile.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get the caller's cart with totals and applied coupon.
     */
    getCart(): Promise<CartView>;
    /**
     * / Fetch one category.
     */
    getCategory(categoryId: CategoryId): Promise<Category | null>;
    /**
     * / Home screen feeds: deals, best selling, new arrivals, discounted, recommended.
     */
    getHomeFeeds(): Promise<HomeFeed>;
    /**
     * / Fetch one of the caller's orders.
     */
    getMyOrder(orderId: OrderId): Promise<Order | null>;
    /**
     * / Fetch one product's detail.
     */
    getProduct(productId: ProductId): Promise<Product | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List the active coupons available to shoppers (public, no admin role required).
     */
    listActiveCoupons(): Promise<Array<Coupon>>;
    /**
     * / List the caller's saved addresses.
     */
    listAddresses(): Promise<Array<SavedAddress>>;
    /**
     * / List all grocery categories with product counts.
     */
    listCategories(): Promise<Array<Category>>;
    /**
     * / List the caller's orders, newest first.
     */
    listMyOrders(): Promise<Array<Order>>;
    /**
     * / List the caller's notifications, newest first.
     */
    listNotifications(): Promise<Array<Notification>>;
    /**
     * / List products in a category.
     */
    listProductsByCategory(categoryId: CategoryId): Promise<Array<Product>>;
    /**
     * / List the caller's recently viewed product ids, newest first.
     */
    listRecentlyViewed(): Promise<Array<ProductId>>;
    /**
     * / List the caller's wishlist product ids.
     */
    listWishlist(): Promise<Array<ProductId>>;
    /**
     * / Mark a notification as read.
     */
    markNotificationRead(notificationId: NotificationId): Promise<boolean>;
    /**
     * / Place an order from the caller's cart.
     */
    placeOrder(input: CheckoutInput): Promise<OrderId>;
    /**
     * / Record a product as recently viewed by the caller.
     */
    recordRecentlyViewed(productId: ProductId): Promise<void>;
    /**
     * / Remove the applied coupon from the caller's cart.
     */
    removeCoupon(): Promise<void>;
    /**
     * / Remove a product from the caller's cart.
     */
    removeFromCart(productId: ProductId): Promise<boolean>;
    /**
     * / Save the caller's profile.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    schema(): Promise<string>;
    /**
     * / Search and filter products by name, brand, category and price range.
     */
    searchProducts(filter: ProductFilter): Promise<Array<Product>>;
    /**
     * / Set a cart line's quantity (0 removes it).
     */
    setCartQuantity(productId: ProductId, quantity: bigint): Promise<CartError>;
    /**
     * / Toggle a product in the caller's wishlist. Returns true when now present.
     */
    toggleWishlist(productId: ProductId): Promise<boolean>;
    /**
     * / Update a saved address.
     */
    updateAddress(addressId: AddressId, address: Address): Promise<boolean>;
}
