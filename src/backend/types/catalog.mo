import Debug "mo:core/Debug";
import Common "common";

module {
  /// Internal product record stored in the catalog.
  public type ProductInternal = {
    id : Common.ProductId;
    categoryId : Common.CategoryId;
    name : Text;
    brand : Text;
    packSize : Common.PackSize;
    imageUrl : Text;
    originalPrice : Common.Paise;
    discountPrice : Common.Paise;
    stockQuantity : Nat;
    description : Text;
    createdAt : Common.Timestamp;
  };

  /// Internal category record.
  public type CategoryInternal = {
    id : Common.CategoryId;
    name : Text;
    imageUrl : Text;
  };

  /// Internal coupon record.
  public type CouponInternal = {
    id : Common.CouponId;
    code : Text;
    description : Text;
    discountPercent : Nat;
    minOrderValue : Common.Paise;
    maxDiscount : Common.Paise;
    active : Bool;
  };

  /// Mutable counters shared with the catalog mixin.
  public type CatalogState = {
    var nextProductId : Nat;
    var nextCategoryId : Nat;
    var nextCouponId : Nat;
  };

  /// Ignore helper kept so this module compiles as a pure type module.
  public func _unused() : () {
    ignore Debug;
  };
};
