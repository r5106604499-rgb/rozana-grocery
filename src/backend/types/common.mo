import Debug "mo:core/Debug";
import Principal "mo:core/Principal";

module {
  /// Unique identifier for a product.
  public type ProductId = Nat;

  /// Unique identifier for a category.
  public type CategoryId = Nat;

  /// Unique identifier for an order.
  public type OrderId = Nat;

  /// Unique identifier for a coupon.
  public type CouponId = Nat;

  /// Unique identifier for a saved address.
  public type AddressId = Nat;

  /// Unique identifier for a notification.
  public type NotificationId = Nat;

  /// Nanosecond timestamp (Time.now()).
  public type Timestamp = Int;

  /// Money amount in paise (1 rupee = 100 paise).
  public type Paise = Nat;

  /// Weight/quantity label, e.g. "5 kg", "1 L", "200 g".
  public type PackSize = Text;

  /// A single line item in a cart or order.
  public type CartLine = {
    productId : ProductId;
    quantity : Nat;
  };

  /// A line item snapshot captured at order time.
  public type OrderLine = {
    productId : ProductId;
    name : Text;
    brand : Text;
    packSize : PackSize;
    imageUrl : Text;
    unitPrice : Paise;
    originalUnitPrice : Paise;
    quantity : Nat;
    lineTotal : Paise;
  };

  /// Payment method choice captured at checkout. No gateway processing occurs.
  public type PaymentMethod = {
    #cod;
    #online;
  };

  /// Order lifecycle status.
  public type OrderStatus = {
    #placed;
    #confirmed;
    #packing;
    #outForDelivery;
    #delivered;
  };

  /// A delivery address supplied at checkout or saved to the account.
  public type Address = {
    fullName : Text;
    mobile : Text;
    houseFlat : Text;
    area : Text;
    pincode : Text;
    landmark : Text;
    instructions : Text;
  };

  /// A saved address with an id.
  public type SavedAddress = {
    id : AddressId;
    address : Address;
  };

  /// A product as exposed to the storefront.
  public type Product = {
    id : ProductId;
    categoryId : CategoryId;
    name : Text;
    brand : Text;
    packSize : PackSize;
    imageUrl : Text;
    originalPrice : Paise;
    discountPrice : Paise;
    discountPercent : Nat;
    inStock : Bool;
    stockQuantity : Nat;
    description : Text;
    createdAt : Timestamp;
  };

  /// A category as exposed to the storefront.
  public type Category = {
    id : CategoryId;
    name : Text;
    imageUrl : Text;
    productCount : Nat;
  };

  /// A coupon as exposed to the storefront.
  public type Coupon = {
    id : CouponId;
    code : Text;
    description : Text;
    discountPercent : Nat;
    minOrderValue : Paise;
    maxDiscount : Paise;
    active : Bool;
  };

  /// A notification for a signed-in user.
  public type Notification = {
    id : NotificationId;
    title : Text;
    body : Text;
    createdAt : Timestamp;
    read : Bool;
  };

  /// The signed-in user's profile.
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  /// A customer summary for the admin panel.
  public type CustomerSummary = {
    principal : Principal;
    name : Text;
    email : ?Text;
    orderCount : Nat;
    totalSpent : Paise;
  };

  /// Aggregate sales figures for the admin dashboard.
  public type SalesSummary = {
    totalOrders : Nat;
    totalRevenue : Paise;
    totalProducts : Nat;
    totalCustomers : Nat;
    ordersByStatus : [(Text, Nat)];
  };

  /// A cart line enriched with product details and computed totals.
  public type CartItemView = {
    productId : ProductId;
    name : Text;
    brand : Text;
    packSize : PackSize;
    imageUrl : Text;
    unitPrice : Paise;
    originalUnitPrice : Paise;
    quantity : Nat;
    lineTotal : Paise;
    inStock : Bool;
  };

  /// The full cart view returned to the frontend.
  public type CartView = {
    items : [CartItemView];
    itemCount : Nat;
    subtotal : Paise;
    discountTotal : Paise;
    deliveryCharge : Paise;
    couponCode : ?Text;
    couponDiscount : Paise;
    total : Paise;
    freeDeliveryThreshold : Paise;
  };

  /// An order as exposed to the customer.
  public type Order = {
    id : OrderId;
    lines : [OrderLine];
    subtotal : Paise;
    discountTotal : Paise;
    deliveryCharge : Paise;
    couponCode : ?Text;
    couponDiscount : Paise;
    total : Paise;
    address : Address;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    placedAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// A product feed section on the home screen.
  public type HomeFeed = {
    todaysDeals : [Product];
    bestSelling : [Product];
    newArrivals : [Product];
    discounted : [Product];
    recommended : [Product];
  };

  /// Search and filter parameters for the product grid.
  public type ProductFilter = {
    searchTerm : ?Text;
    categoryId : ?CategoryId;
    minPrice : ?Paise;
    maxPrice : ?Paise;
    inStockOnly : Bool;
  };

  /// Error shape for cart and checkout operations.
  public type CartError = {
    #productNotFound : ProductId;
    #outOfStock : ProductId;
    #invalidQuantity;
    #couponNotFound : Text;
    #couponInactive : Text;
    #couponMinOrderNotMet : { required : Paise; actual : Paise };
    #emptyCart;
    #invalidAddress : Text;
    #invalidMobile : Text;
    #invalidPincode : Text;
  };

  /// Error shape for admin catalog operations.
  public type CatalogError = {
    #productNotFound : ProductId;
    #categoryNotFound : CategoryId;
    #invalidPrice;
    #invalidDiscount;
    #duplicateCoupon : Text;
  };

  /// Error shape for account operations.
  public type AccountError = {
    #addressNotFound : AddressId;
    #invalidAddress : Text;
    #notFound;
  };

  /// Input for creating or updating a product (admin).
  public type ProductInput = {
    categoryId : CategoryId;
    name : Text;
    brand : Text;
    packSize : PackSize;
    imageUrl : Text;
    originalPrice : Paise;
    discountPrice : Paise;
    stockQuantity : Nat;
    description : Text;
  };

  /// Input for creating a category (admin).
  public type CategoryInput = {
    name : Text;
    imageUrl : Text;
  };

  /// Input for creating or updating a coupon (admin).
  public type CouponInput = {
    code : Text;
    description : Text;
    discountPercent : Nat;
    minOrderValue : Paise;
    maxDiscount : Paise;
    active : Bool;
  };

  /// Input for placing an order.
  public type CheckoutInput = {
    address : Address;
    paymentMethod : PaymentMethod;
    couponCode : ?Text;
  };

  /// Ignore helper kept so this module compiles as a pure type module.
  public func _unused() : () {
    ignore Debug;
  };
};
