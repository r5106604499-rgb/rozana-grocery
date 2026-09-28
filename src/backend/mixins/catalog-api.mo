import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CatalogTypes "../types/catalog";
import CatalogLib "../lib/catalog";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
  categories : Map.Map<Common.CategoryId, CatalogTypes.CategoryInternal>,
  coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
  catalogState : CatalogTypes.CatalogState,
) {
  // ---- Public storefront reads ----

  /// List all grocery categories with product counts.
  public query func listCategories() : async [Common.Category] {
    CatalogLib.listCategories(categories, products);
  };

  /// Fetch one category.
  public query func getCategory(categoryId : Common.CategoryId) : async ?Common.Category {
    CatalogLib.getCategory(categories, products, categoryId);
  };

  /// Fetch one product's detail.
  public query func getProduct(productId : Common.ProductId) : async ?Common.Product {
    CatalogLib.getProduct(products, productId);
  };

  /// List products in a category.
  public query func listProductsByCategory(categoryId : Common.CategoryId) : async [Common.Product] {
    CatalogLib.listProductsByCategory(products, categoryId);
  };

  /// Search and filter products by name, brand, category and price range.
  public query func searchProducts(filter : Common.ProductFilter) : async [Common.Product] {
    CatalogLib.searchProducts(products, filter);
  };

  /// Home screen feeds: deals, best selling, new arrivals, discounted, recommended.
  public query func getHomeFeeds() : async Common.HomeFeed {
    let recentlyViewed = List.empty<Common.ProductId>();
    CatalogLib.homeFeeds(products, recentlyViewed);
  };

  /// List the active coupons available to shoppers (public, no admin role required).
  public query func listActiveCoupons() : async [Common.Coupon] {
    CatalogLib.listActiveCoupons(coupons);
  };

  // ---- Admin catalog management ----

  /// Add a product (admin only).
  public shared ({ caller }) func adminAddProduct(input : Common.ProductInput) : async Common.ProductId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.addProduct(products, catalogState, input);
  };

  /// Update a product (admin only).
  public shared ({ caller }) func adminUpdateProduct(productId : Common.ProductId, input : Common.ProductInput) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.updateProduct(products, productId, input);
  };

  /// Delete a product (admin only).
  public shared ({ caller }) func adminDeleteProduct(productId : Common.ProductId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.deleteProduct(products, productId);
  };

  /// Set a product's stock quantity (admin only).
  public shared ({ caller }) func adminSetStock(productId : Common.ProductId, stockQuantity : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.setStock(products, productId, stockQuantity);
  };

  /// Add a category (admin only).
  public shared ({ caller }) func adminAddCategory(input : Common.CategoryInput) : async Common.CategoryId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.addCategory(categories, catalogState, input);
  };

  /// List all coupons (admin only).
  public query ({ caller }) func adminListCoupons() : async [Common.Coupon] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.listCoupons(coupons);
  };

  /// Add a coupon (admin only).
  public shared ({ caller }) func adminAddCoupon(input : Common.CouponInput) : async Common.CouponId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.addCoupon(coupons, catalogState, input);
  };

  /// Update a coupon (admin only).
  public shared ({ caller }) func adminUpdateCoupon(couponId : Common.CouponId, input : Common.CouponInput) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.updateCoupon(coupons, couponId, input);
  };

  /// Delete a coupon (admin only).
  public shared ({ caller }) func adminDeleteCoupon(couponId : Common.CouponId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    CatalogLib.deleteCoupon(coupons, couponId);
  };
};
