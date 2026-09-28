/// Behavioral API documentation for agents and integrators.
///
/// This mixin exposes a single static `getApiDoc` query. It reads no actor
/// state, so it takes no parameters and is safe to call anonymously.
mixin () {
  /// Return the backend's behavioral API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "# Rozana Grocery — Backend API\n" #
    "\n" #
    "Online grocery & daily-essentials delivery backend. It sells only grocery,\n" #
    "food, personal-care and household daily-use products. There is no footwear,\n" #
    "clothing, fashion, electronics, furniture, or medicine catalogue.\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "- Public storefront reads (`listCategories`, `getCategory`, `getProduct`,\n" #
    "  `listProductsByCategory`, `searchProducts`, `getHomeFeeds`) are `query`\n" #
    "  functions callable by anyone, including anonymous callers.\n" #
    "- Every cart, order, address, wishlist, notification and profile method is\n" #
    "  scoped to the caller principal. There is no cross-user read endpoint.\n" #
    "- Admin methods (`adminAddProduct`, `adminUpdateProduct`, `adminDeleteProduct`,\n" #
    "  `adminSetStock`, `adminAddCategory`, `adminListCoupons`, `adminAddCoupon`,\n" #
    "  `adminUpdateCoupon`, `adminDeleteCoupon`, `adminSalesSummary`,\n" #
    "  `adminListOrders`, `adminSetOrderStatus`, `adminListCustomers`) require the\n" #
    "  caller to hold the admin role. A non-admin caller traps with\n" #
    "  `Unauthorized: admin role required`.\n" #
    "- The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "  `/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "  the user's Internet Identity authorization derives the correct per-app\n" #
    "  principal against that origin (for example\n" #
    "  `icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "  user's full authority in this app until it expires.\n" #
    "- Registration prerequisite: access control is initialized by calling\n" #
    "  `_initialize_access_control` once as a signed-in caller before any\n" #
    "  role-guarded call, guarded queries included. The first initializer receives\n" #
    "  the admin role; subsequent callers receive the regular user role. A caller\n" #
    "  that never signed in through the app's own frontend is unregistered even when\n" #
    "  it belongs to the app's owner, and a signed-in caller derived against a\n" #
    "  different origin is a different principal than the one the frontend\n" #
    "  registered. An unregistered caller on a guarded endpoint traps with\n" #
    "  `Unauthorized: admin role required` (admin endpoints) or receives an empty\n" #
    "  per-user result (cart/order/account endpoints, which are keyed by principal\n" #
    "  and simply have no rows yet).\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- All money amounts are `Nat` paise (1 rupee = 100 paise). `59900` means ₹599.00.\n" #
    "- All timestamps are `Int` nanoseconds from `Time.now()`.\n" #
    "- `packSize` is a display label such as `\"5 kg\"`, `\"1 L\"`, `\"200 g\"`.\n" #
    "- `PaymentMethod` is `#cod` or `#online`. Online payment is captured as a\n" #
    "  method choice only — no payment gateway is contacted and no card data is\n" #
    "  stored.\n" #
    "- `OrderStatus` is one of `#placed`, `#confirmed`, `#packing`,\n" #
    "  `#outForDelivery`, `#delivered`.\n" #
    "- Optional values (`?Text`) are Candid `opt`; absent means no value.\n" #
    "\n" #
    "## Public methods\n" #
    "\n" #
    "### Catalogue (public)\n" #
    "\n" #
    "- `listCategories() : [Category]` — all categories with product counts.\n" #
    "- `getCategory(categoryId) : ?Category`\n" #
    "- `getProduct(productId) : ?Product`\n" #
    "- `listProductsByCategory(categoryId) : [Product]`\n" #
    "- `searchProducts(filter : ProductFilter) : [Product]` — `filter` carries\n" #
    "  `searchTerm`, `categoryId`, `minPrice`, `maxPrice` (paise) and `inStockOnly`.\n" #
    "- `getHomeFeeds() : HomeFeed` — `todaysDeals`, `bestSelling`, `newArrivals`,\n" #
    "  `discounted`, `recommended`.\n" #
    "\n" #
    "### Cart (caller-scoped)\n" #
    "\n" #
    "- `getCart() : CartView` — items, subtotal, discountTotal, deliveryCharge,\n" #
    "  couponCode, couponDiscount, total, freeDeliveryThreshold.\n" #
    "- `addToCart(productId, quantity) : CartError`\n" #
    "- `setCartQuantity(productId, quantity) : CartError` — quantity `0` removes the line.\n" #
    "- `removeFromCart(productId) : Bool`\n" #
    "- `clearCart() : ()`\n" #
    "- `applyCoupon(code) : CartError`\n" #
    "- `removeCoupon() : ()`\n" #
    "\n" #
    "### Orders (caller-scoped)\n" #
    "\n" #
    "- `placeOrder(input : CheckoutInput) : OrderId` — traps with `Cart is empty`\n" #
    "  when the cart has no lines.\n" #
    "- `listMyOrders() : [Order]` — newest first.\n" #
    "- `getMyOrder(orderId) : ?Order`\n" #
    "\n" #
    "### Account (caller-scoped)\n" #
    "\n" #
    "- `getCallerUserProfile() : ?UserProfile`\n" #
    "- `saveCallerUserProfile(profile : UserProfile) : ()`\n" #
    "- `getCallerEmail() : ?Text`\n" #
    "- `listAddresses() : [SavedAddress]`\n" #
    "- `addAddress(address) : AddressId`\n" #
    "- `updateAddress(addressId, address) : Bool`\n" #
    "- `deleteAddress(addressId) : Bool`\n" #
    "- `listWishlist() : [ProductId]`\n" #
    "- `toggleWishlist(productId) : Bool` — returns `true` when the product is now\n" #
    "  present in the wishlist.\n" #
    "- `listNotifications() : [Notification]` — newest first.\n" #
    "- `markNotificationRead(notificationId) : Bool`\n" #
    "- `recordRecentlyViewed(productId) : ()`\n" #
    "- `listRecentlyViewed() : [ProductId]` — newest first.\n" #
    "\n" #
    "### Admin (admin role required)\n" #
    "\n" #
    "- `adminAddProduct(input) : ProductId`\n" #
    "- `adminUpdateProduct(productId, input) : Bool`\n" #
    "- `adminDeleteProduct(productId) : Bool`\n" #
    "- `adminSetStock(productId, stockQuantity) : Bool`\n" #
    "- `adminAddCategory(input) : CategoryId`\n" #
    "- `adminListCoupons() : [Coupon]`\n" #
    "- `adminAddCoupon(input) : CouponId`\n" #
    "- `adminUpdateCoupon(couponId, input) : Bool`\n" #
    "- `adminDeleteCoupon(couponId) : Bool`\n" #
    "- `adminSalesSummary() : SalesSummary`\n" #
    "- `adminListOrders() : [(Principal, Order)]`\n" #
    "- `adminSetOrderStatus(customer, orderId, status) : Bool`\n" #
    "- `adminListCustomers() : [CustomerSummary]`\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "- An order is created by `placeOrder` in status `#placed`. The admin advances it\n" #
    "  through `#confirmed`, `#packing`, `#outForDelivery`, `#delivered` with\n" #
    "  `adminSetOrderStatus`. There is no automatic transition and no email\n" #
    "  notification.\n" #
    "- Poll `getMyOrder(orderId)` or `listMyOrders()` to observe status changes.\n" #
    "  `updatedAt` changes on every status transition; `placedAt` is fixed at\n" #
    "  creation. Polling is safe and read-only.\n" #
    "- `getCart()` is a `query` and reflects committed state only.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `addToCart` and `setCartQuantity` are **not** idempotent: `addToCart` adds\n" #
    "  `quantity` to the existing line, so retrying a call that already succeeded\n" #
    "  double-counts. `setCartQuantity` is idempotent — it sets an absolute value.\n" #
    "- `removeFromCart`, `clearCart`, `removeCoupon`, `deleteAddress`,\n" #
    "  `markNotificationRead` are idempotent.\n" #
    "- `toggleWishlist` is **not** idempotent: retrying flips the state back.\n" #
    "- `placeOrder` is **not** idempotent: each successful call creates a new order\n" #
    "  and clears the cart. Do not retry a `placeOrder` whose result was lost\n" #
    "  without first checking `listMyOrders()`.\n" #
    "- `adminSetOrderStatus` is idempotent for a given target status.\n" #
    "- `saveCallerUserProfile` overwrites the stored profile.\n" #
    "\n" #
    "## Errors, traps and gotchas\n" #
    "\n" #
    "- Cart and checkout operations return `CartError` variants:\n" #
    "  `#productNotFound`, `#outOfStock`, `#invalidQuantity`, `#couponNotFound`,\n" #
    "  `#couponInactive`, `#couponMinOrderNotMet`, `#emptyCart`, `#invalidAddress`,\n" #
    "  `#invalidMobile`, `#invalidPincode`.\n" #
    "- **`#invalidQuantity` is the no-error sentinel.** Cart mutation endpoints\n" #
    "  (`addToCart`, `setCartQuantity`, `applyCoupon`) return `#invalidQuantity` to\n" #
    "  mean \"the operation succeeded\". Treat `#invalidQuantity` as success and any\n" #
    "  other variant as a real failure.\n" #
    "- `placeOrder` traps (rather than returning `CartError`) when the cart is empty.\n" #
    "- Admin endpoints trap with `Unauthorized: admin role required` for non-admins.\n" #
    "- `getProduct`, `getCategory` and `getMyOrder` return `null` for a missing id;\n" #
    "  they do not trap.\n" #
    "- `adminUpdateProduct`, `adminDeleteProduct`, `adminSetStock`,\n" #
    "  `adminUpdateCoupon`, `adminDeleteCoupon`, `updateAddress`, `deleteAddress`\n" #
    "  and `markNotificationRead` return `false` when the target id does not exist.\n" #
    "- Product `inStock` is derived from `stockQuantity`; setting stock to `0` marks\n" #
    "  the product out of stock.\n" #
    "- Coupon discounts are capped by `maxDiscount` and require the cart subtotal to\n" #
    "  meet `minOrderValue`.\n";
  };
};
