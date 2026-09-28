import Debug "mo:core/Debug";
import Common "common";

module {
  /// Internal order record stored per customer.
  public type OrderInternal = {
    id : Common.OrderId;
    lines : [Common.OrderLine];
    subtotal : Common.Paise;
    discountTotal : Common.Paise;
    deliveryCharge : Common.Paise;
    couponCode : ?Text;
    couponDiscount : Common.Paise;
    total : Common.Paise;
    address : Common.Address;
    paymentMethod : Common.PaymentMethod;
    status : Common.OrderStatus;
    placedAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// Mutable counters shared with the cart mixin.
  public type CartState = {
    var nextOrderId : Nat;
  };

  /// Ignore helper kept so this module compiles as a pure type module.
  public func _unused() : () {
    ignore Debug;
  };
};
