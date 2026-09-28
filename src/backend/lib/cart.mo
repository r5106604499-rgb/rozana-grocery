import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import CatalogTypes "../types/catalog";
import CartTypes "../types/cart";
import CatalogLib "catalog";

module {
  /// Free delivery threshold in paise (₹499).
  public let freeDeliveryThreshold : Common.Paise = 49900;

  /// Flat delivery charge in paise (₹29).
  public let deliveryCharge : Common.Paise = 2900;

  /// Compute the coupon discount for a subtotal, capped at maxDiscount.
  func couponDiscountFor(coupon : CatalogTypes.CouponInternal, subtotal : Common.Paise) : Common.Paise {
    let raw = (subtotal * coupon.discountPercent) / 100;
    if (raw > coupon.maxDiscount) { coupon.maxDiscount } else { raw };
  };

  /// Replace a cart line's quantity by rebuilding the list (CartLine is immutable).
  func replaceLine(
    cart : List.List<Common.CartLine>,
    productId : Common.ProductId,
    quantity : Nat,
  ) : () {
    let snapshot = cart.toArray();
    cart.clear();
    for (line in snapshot.values()) {
      if (line.productId == productId) {
        cart.add({ productId; quantity });
      } else {
        cart.add(line);
      };
    };
  };

  /// Build the full cart view for a customer.
  public func cartView(
    cart : List.List<Common.CartLine>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    couponCode : ?Text,
  ) : Common.CartView {
    var subtotal = 0;
    var discountTotal = 0;
    var itemCount = 0;
    let items = List.empty<Common.CartItemView>();

    for (line in cart.values()) {
      switch (products.get(line.productId)) {
        case (?product) {
          let unitPrice = product.discountPrice;
          let lineTotal = unitPrice * line.quantity;
          let originalLineTotal = product.originalPrice * line.quantity;
          subtotal += lineTotal;
          if (originalLineTotal > lineTotal) {
            discountTotal += originalLineTotal - lineTotal;
          };
          itemCount += line.quantity;
          items.add({
            productId = product.id;
            name = product.name;
            brand = product.brand;
            packSize = product.packSize;
            imageUrl = product.imageUrl;
            unitPrice;
            originalUnitPrice = product.originalPrice;
            quantity = line.quantity;
            lineTotal;
            inStock = product.stockQuantity >= line.quantity;
          });
        };
        case null {};
      };
    };

    var couponDiscount = 0;
    var appliedCode : ?Text = null;
    switch (couponCode) {
      case (?code) {
        switch (CatalogLib.findCouponByCode(coupons, code)) {
          case (?coupon) {
            if (coupon.active and subtotal >= coupon.minOrderValue) {
              couponDiscount := couponDiscountFor(coupon, subtotal);
              appliedCode := ?coupon.code;
            };
          };
          case null {};
        };
      };
      case null {};
    };

    let afterDiscount = if (subtotal > couponDiscount) { subtotal - couponDiscount } else { 0 };
    let delivery = if (afterDiscount >= freeDeliveryThreshold or afterDiscount == 0) { 0 } else { deliveryCharge };

    {
      items = items.toArray();
      itemCount;
      subtotal;
      discountTotal;
      deliveryCharge = delivery;
      couponCode = appliedCode;
      couponDiscount;
      total = afterDiscount + delivery;
      freeDeliveryThreshold;
    };
  };

  /// Add a product to the cart (or increment its quantity).
  public func addToCart(
    cart : List.List<Common.CartLine>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    productId : Common.ProductId,
    quantity : Nat,
  ) : Common.CartError {
    if (quantity == 0) {
      return #invalidQuantity;
    };
    let product = switch (products.get(productId)) {
      case (?p) { p };
      case null { return #productNotFound(productId) };
    };
    if (product.stockQuantity == 0) {
      return #outOfStock(productId);
    };
    switch (cart.find(func(line) = line.productId == productId)) {
      case (?line) {
        let newQuantity = line.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          return #outOfStock(productId);
        };
        replaceLine(cart, productId, newQuantity);
      };
      case null {
        if (quantity > product.stockQuantity) {
          return #outOfStock(productId);
        };
        cart.add({ productId; quantity });
      };
    };
    #invalidQuantity;
  };

  /// Set the quantity of a cart line; zero removes it.
  public func setCartQuantity(
    cart : List.List<Common.CartLine>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    productId : Common.ProductId,
    quantity : Nat,
  ) : Common.CartError {
    if (quantity == 0) {
      ignore removeFromCart(cart, productId);
      return #invalidQuantity;
    };
    let product = switch (products.get(productId)) {
      case (?p) { p };
      case null { return #productNotFound(productId) };
    };
    if (quantity > product.stockQuantity) {
      return #outOfStock(productId);
    };
    switch (cart.find(func(line) = line.productId == productId)) {
      case (?_) { replaceLine(cart, productId, quantity) };
      case null { cart.add({ productId; quantity }) };
    };
    #invalidQuantity;
  };

  /// Remove a product from the cart.
  public func removeFromCart(
    cart : List.List<Common.CartLine>,
    productId : Common.ProductId,
  ) : Bool {
    var removed = false;
    let snapshot = cart.toArray();
    cart.clear();
    for (line in snapshot.values()) {
      if (line.productId == productId) {
        removed := true;
      } else {
        cart.add(line);
      };
    };
    removed;
  };

  /// Clear the cart.
  public func clearCart(cart : List.List<Common.CartLine>) : () {
    cart.clear();
  };

  /// Validate a coupon code against the current subtotal.
  public func validateCoupon(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    code : Text,
    subtotal : Common.Paise,
  ) : Common.CartError {
    let coupon = switch (CatalogLib.findCouponByCode(coupons, code)) {
      case (?c) { c };
      case null { return #couponNotFound(code) };
    };
    if (not coupon.active) {
      return #couponInactive(coupon.code);
    };
    if (subtotal < coupon.minOrderValue) {
      return #couponMinOrderNotMet({ required = coupon.minOrderValue; actual = subtotal });
    };
    #invalidQuantity;
  };

  /// Place an order from the cart. Returns the created order.
  public func placeOrder(
    cart : List.List<Common.CartLine>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    state : CartTypes.CartState,
    input : Common.CheckoutInput,
  ) : CartTypes.OrderInternal {
    let view = cartView(cart, products, coupons, input.couponCode);

    let lines = List.empty<Common.OrderLine>();
    for (line in cart.values()) {
      switch (products.get(line.productId)) {
        case (?product) {
          lines.add({
            productId = product.id;
            name = product.name;
            brand = product.brand;
            packSize = product.packSize;
            imageUrl = product.imageUrl;
            unitPrice = product.discountPrice;
            originalUnitPrice = product.originalPrice;
            quantity = line.quantity;
            lineTotal = product.discountPrice * line.quantity;
          });
        };
        case null {};
      };
    };

    let id = state.nextOrderId;
    state.nextOrderId := id + 1;
    let now = Time.now();

    let order : CartTypes.OrderInternal = {
      id;
      lines = lines.toArray();
      subtotal = view.subtotal;
      discountTotal = view.discountTotal;
      deliveryCharge = view.deliveryCharge;
      couponCode = view.couponCode;
      couponDiscount = view.couponDiscount;
      total = view.total;
      address = input.address;
      paymentMethod = input.paymentMethod;
      status = #placed;
      placedAt = now;
      updatedAt = now;
    };

    // Decrement stock for each ordered line.
    for (line in cart.values()) {
      switch (products.get(line.productId)) {
        case (?product) {
          let remaining = if (product.stockQuantity > line.quantity) {
            product.stockQuantity - line.quantity;
          } else { 0 };
          products.add(line.productId, { product with stockQuantity = remaining });
        };
        case null {};
      };
    };

    cart.clear();
    order;
  };

  /// List a customer's orders, newest first.
  public func listOrders(orders : List.List<CartTypes.OrderInternal>) : [Common.Order] {
    let views = orders.values().map(func(order) = toOrder(order));
    views.toArray().sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  /// Fetch one of a customer's orders.
  public func getOrder(
    orders : List.List<CartTypes.OrderInternal>,
    orderId : Common.OrderId,
  ) : ?Common.Order {
    switch (orders.find(func(order) = order.id == orderId)) {
      case (?order) { ?toOrder(order) };
      case null { null };
    };
  };

  /// Convert an internal order to its view.
  public func toOrder(self : CartTypes.OrderInternal) : Common.Order {
    {
      id = self.id;
      lines = self.lines;
      subtotal = self.subtotal;
      discountTotal = self.discountTotal;
      deliveryCharge = self.deliveryCharge;
      couponCode = self.couponCode;
      couponDiscount = self.couponDiscount;
      total = self.total;
      address = self.address;
      paymentMethod = self.paymentMethod;
      status = self.status;
      placedAt = self.placedAt;
      updatedAt = self.updatedAt;
    };
  };
};
