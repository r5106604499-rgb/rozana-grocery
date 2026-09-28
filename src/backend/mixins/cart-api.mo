import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CatalogTypes "../types/catalog";
import CartTypes "../types/cart";
import CartLib "../lib/cart";
import CatalogLib "../lib/catalog";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
  coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
  carts : Map.Map<Principal, List.List<Common.CartLine>>,
  cartCoupons : Map.Map<Principal, Text>,
  orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>,
  cartState : CartTypes.CartState,
) {
  /// Fetch (creating if needed) the caller's cart lines.
  func callerCart(caller : Principal) : List.List<Common.CartLine> {
    switch (carts.get(caller)) {
      case (?cart) { cart };
      case null {
        let cart = List.empty<Common.CartLine>();
        carts.add(caller, cart);
        cart;
      };
    };
  };

  /// Fetch (creating if needed) the caller's order list.
  func callerOrders(caller : Principal) : List.List<CartTypes.OrderInternal> {
    switch (orders.get(caller)) {
      case (?list) { list };
      case null {
        let list = List.empty<CartTypes.OrderInternal>();
        orders.add(caller, list);
        list;
      };
    };
  };

  /// Get the caller's cart with totals and applied coupon.
  public query ({ caller }) func getCart() : async Common.CartView {
    let cart = switch (carts.get(caller)) {
      case (?c) { c };
      case null { List.empty<Common.CartLine>() };
    };
    CartLib.cartView(cart, products, coupons, cartCoupons.get(caller));
  };

  /// Add a product to the caller's cart.
  public shared ({ caller }) func addToCart(productId : Common.ProductId, quantity : Nat) : async Common.CartError {
    let cart = callerCart(caller);
    CartLib.addToCart(cart, products, productId, quantity);
  };

  /// Set a cart line's quantity (0 removes it).
  public shared ({ caller }) func setCartQuantity(productId : Common.ProductId, quantity : Nat) : async Common.CartError {
    let cart = callerCart(caller);
    CartLib.setCartQuantity(cart, products, productId, quantity);
  };

  /// Remove a product from the caller's cart.
  public shared ({ caller }) func removeFromCart(productId : Common.ProductId) : async Bool {
    let cart = callerCart(caller);
    CartLib.removeFromCart(cart, productId);
  };

  /// Clear the caller's cart.
  public shared ({ caller }) func clearCart() : async () {
    let cart = callerCart(caller);
    CartLib.clearCart(cart);
    cartCoupons.remove(caller);
  };

  /// Apply a coupon code to the caller's cart.
  public shared ({ caller }) func applyCoupon(code : Text) : async Common.CartError {
    let cart = callerCart(caller);
    let view = CartLib.cartView(cart, products, coupons, null);
    let result = CartLib.validateCoupon(coupons, code, view.subtotal);
    switch (result) {
      case (#invalidQuantity) {
        switch (CatalogLib.findCouponByCode(coupons, code)) {
          case (?coupon) { cartCoupons.add(caller, coupon.code) };
          case null {};
        };
        #invalidQuantity;
      };
      case _ { result };
    };
  };

  /// Remove the applied coupon from the caller's cart.
  public shared ({ caller }) func removeCoupon() : async () {
    cartCoupons.remove(caller);
  };

  /// Place an order from the caller's cart.
  public shared ({ caller }) func placeOrder(input : Common.CheckoutInput) : async Common.OrderId {
    let cart = callerCart(caller);
    if (cart.size() == 0) {
      Runtime.trap("Cart is empty");
    };
    let order = CartLib.placeOrder(cart, products, coupons, cartState, input);
    let customerOrders = callerOrders(caller);
    customerOrders.add(order);
    cartCoupons.remove(caller);
    order.id;
  };

  /// List the caller's orders, newest first.
  public query ({ caller }) func listMyOrders() : async [Common.Order] {
    switch (orders.get(caller)) {
      case (?list) { CartLib.listOrders(list) };
      case null { [] };
    };
  };

  /// Fetch one of the caller's orders.
  public query ({ caller }) func getMyOrder(orderId : Common.OrderId) : async ?Common.Order {
    switch (orders.get(caller)) {
      case (?list) { CartLib.getOrder(list, orderId) };
      case null { null };
    };
  };
};
