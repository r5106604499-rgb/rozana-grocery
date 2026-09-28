import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import CatalogTypes "../types/catalog";

module {
  /// Convert an internal product to its storefront view.
  public func toProduct(self : CatalogTypes.ProductInternal) : Common.Product {
    {
      id = self.id;
      categoryId = self.categoryId;
      name = self.name;
      brand = self.brand;
      packSize = self.packSize;
      imageUrl = self.imageUrl;
      originalPrice = self.originalPrice;
      discountPrice = self.discountPrice;
      discountPercent = discountPercent(self.originalPrice, self.discountPrice);
      inStock = self.stockQuantity > 0;
      stockQuantity = self.stockQuantity;
      description = self.description;
      createdAt = self.createdAt;
    };
  };

  /// Convert an internal category to its storefront view.
  public func toCategory(self : CatalogTypes.CategoryInternal, productCount : Nat) : Common.Category {
    {
      id = self.id;
      name = self.name;
      imageUrl = self.imageUrl;
      productCount;
    };
  };

  /// Convert an internal coupon to its storefront view.
  public func toCoupon(self : CatalogTypes.CouponInternal) : Common.Coupon {
    {
      id = self.id;
      code = self.code;
      description = self.description;
      discountPercent = self.discountPercent;
      minOrderValue = self.minOrderValue;
      maxDiscount = self.maxDiscount;
      active = self.active;
    };
  };

  /// Compute the discount percentage from original and discount prices.
  public func discountPercent(originalPrice : Common.Paise, discountPrice : Common.Paise) : Nat {
    if (originalPrice == 0 or discountPrice >= originalPrice) {
      return 0;
    };
    let off = originalPrice - discountPrice;
    (off * 100) / originalPrice;
  };

  /// Count the products belonging to a category.
  func countProducts(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    categoryId : Common.CategoryId,
  ) : Nat {
    var count = 0;
    for (product in products.values()) {
      if (product.categoryId == categoryId) {
        count += 1;
      };
    };
    count;
  };

  /// List all categories with their product counts.
  public func listCategories(
    categories : Map.Map<Common.CategoryId, CatalogTypes.CategoryInternal>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
  ) : [Common.Category] {
    let views = categories.values().map(
      func(category) = toCategory(category, countProducts(products, category.id))
    );
    views.toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Fetch a single category view.
  public func getCategory(
    categories : Map.Map<Common.CategoryId, CatalogTypes.CategoryInternal>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    categoryId : Common.CategoryId,
  ) : ?Common.Category {
    switch (categories.get(categoryId)) {
      case (?category) { ?toCategory(category, countProducts(products, categoryId)) };
      case null { null };
    };
  };

  /// Fetch a single product view.
  public func getProduct(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    productId : Common.ProductId,
  ) : ?Common.Product {
    switch (products.get(productId)) {
      case (?product) { ?toProduct(product) };
      case null { null };
    };
  };

  /// List products in a category.
  public func listProductsByCategory(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    categoryId : Common.CategoryId,
  ) : [Common.Product] {
    let views = products.values().filter(
      func(product) = product.categoryId == categoryId
    ).map(func(product) = toProduct(product));
    views.toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Search and filter products.
  public func searchProducts(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    filter : Common.ProductFilter,
  ) : [Common.Product] {
    let term = switch (filter.searchTerm) {
      case (?t) { ?t.trim(#text(" ")).toLower() };
      case null { null };
    };
    let views = products.values().filter(
      func(product) {
        let matchesTerm = switch (term) {
          case (?t) {
            product.name.toLower().contains(#text(t)) or product.brand.toLower().contains(#text(t));
          };
          case null { true };
        };
        let matchesCategory = switch (filter.categoryId) {
          case (?id) { product.categoryId == id };
          case null { true };
        };
        let matchesMin = switch (filter.minPrice) {
          case (?min) { product.discountPrice >= min };
          case null { true };
        };
        let matchesMax = switch (filter.maxPrice) {
          case (?max) { product.discountPrice <= max };
          case null { true };
        };
        let matchesStock = not filter.inStockOnly or product.stockQuantity > 0;
        matchesTerm and matchesCategory and matchesMin and matchesMax and matchesStock;
      }
    ).map(func(product) = toProduct(product));
    views.toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Build the home screen feeds.
  public func homeFeeds(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    recentlyViewed : List.List<Common.ProductId>,
  ) : Common.HomeFeed {
    let all = products.values().toArray();

    let todaysDeals = all.filter(
      func(product) = discountPercent(product.originalPrice, product.discountPrice) >= 10
    ).sort(func(a, b) = Nat.compare(b.id, a.id)).sliceToArray(0, 12);

    let bestSelling = all.sort(
      func(a, b) = Nat.compare(b.stockQuantity, a.stockQuantity)
    ).sliceToArray(0, 12);

    let newArrivals = all.sort(
      func(a, b) = Int.compare(b.createdAt, a.createdAt)
    ).sliceToArray(0, 12);

    let discounted = all.filter(
      func(product) = product.discountPrice < product.originalPrice
    ).sort(
      func(a, b) = Nat.compare(
        discountPercent(b.originalPrice, b.discountPrice),
        discountPercent(a.originalPrice, a.discountPrice),
      )
    ).sliceToArray(0, 12);

    let recommended = all.sort(
      func(a, b) = Nat.compare(a.id, b.id)
    ).sliceToArray(0, 12);

    {
      todaysDeals = todaysDeals.map(func(product) = toProduct(product));
      bestSelling = bestSelling.map(func(product) = toProduct(product));
      newArrivals = newArrivals.map(func(product) = toProduct(product));
      discounted = discounted.map(func(product) = toProduct(product));
      recommended = recommended.map(func(product) = toProduct(product));
    };
  };

  /// Add a product (admin). Returns the new product id.
  public func addProduct(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    state : CatalogTypes.CatalogState,
    input : Common.ProductInput,
  ) : Common.ProductId {
    let id = state.nextProductId;
    state.nextProductId := id + 1;
    products.add(id, {
      id;
      categoryId = input.categoryId;
      name = input.name;
      brand = input.brand;
      packSize = input.packSize;
      imageUrl = input.imageUrl;
      originalPrice = input.originalPrice;
      discountPrice = input.discountPrice;
      stockQuantity = input.stockQuantity;
      description = input.description;
      createdAt = Time.now();
    });
    id;
  };

  /// Update an existing product (admin).
  public func updateProduct(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    productId : Common.ProductId,
    input : Common.ProductInput,
  ) : Bool {
    switch (products.get(productId)) {
      case (?existing) {
        products.add(productId, {
          id = existing.id;
          categoryId = input.categoryId;
          name = input.name;
          brand = input.brand;
          packSize = input.packSize;
          imageUrl = input.imageUrl;
          originalPrice = input.originalPrice;
          discountPrice = input.discountPrice;
          stockQuantity = input.stockQuantity;
          description = input.description;
          createdAt = existing.createdAt;
        });
        true;
      };
      case null { false };
    };
  };

  /// Delete a product (admin).
  public func deleteProduct(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    productId : Common.ProductId,
  ) : Bool {
    switch (products.get(productId)) {
      case (?_) { products.remove(productId); true };
      case null { false };
    };
  };

  /// Set a product's stock quantity (admin).
  public func setStock(
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    productId : Common.ProductId,
    stockQuantity : Nat,
  ) : Bool {
    switch (products.get(productId)) {
      case (?existing) {
        products.add(productId, { existing with stockQuantity });
        true;
      };
      case null { false };
    };
  };

  /// Add a category (admin). Returns the new category id.
  public func addCategory(
    categories : Map.Map<Common.CategoryId, CatalogTypes.CategoryInternal>,
    state : CatalogTypes.CatalogState,
    input : Common.CategoryInput,
  ) : Common.CategoryId {
    let id = state.nextCategoryId;
    state.nextCategoryId := id + 1;
    categories.add(id, { id; name = input.name; imageUrl = input.imageUrl });
    id;
  };

  /// List all coupons (admin).
  public func listCoupons(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
  ) : [Common.Coupon] {
    let views = coupons.values().map(func(coupon) = toCoupon(coupon));
    views.toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// List only the active coupons available to shoppers.
  public func listActiveCoupons(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
  ) : [Common.Coupon] {
    let views = coupons.values().filter(
      func(coupon) = coupon.active
    ).map(func(coupon) = toCoupon(coupon));
    views.toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Add a coupon (admin). Returns the new coupon id.
  public func addCoupon(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    state : CatalogTypes.CatalogState,
    input : Common.CouponInput,
  ) : Common.CouponId {
    let id = state.nextCouponId;
    state.nextCouponId := id + 1;
    coupons.add(id, {
      id;
      code = input.code;
      description = input.description;
      discountPercent = input.discountPercent;
      minOrderValue = input.minOrderValue;
      maxDiscount = input.maxDiscount;
      active = input.active;
    });
    id;
  };

  /// Update a coupon (admin).
  public func updateCoupon(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    couponId : Common.CouponId,
    input : Common.CouponInput,
  ) : Bool {
    switch (coupons.get(couponId)) {
      case (?existing) {
        coupons.add(couponId, {
          id = existing.id;
          code = input.code;
          description = input.description;
          discountPercent = input.discountPercent;
          minOrderValue = input.minOrderValue;
          maxDiscount = input.maxDiscount;
          active = input.active;
        });
        true;
      };
      case null { false };
    };
  };

  /// Delete a coupon (admin).
  public func deleteCoupon(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    couponId : Common.CouponId,
  ) : Bool {
    switch (coupons.get(couponId)) {
      case (?_) { coupons.remove(couponId); true };
      case null { false };
    };
  };

  /// Look up a coupon by its code.
  public func findCouponByCode(
    coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>,
    code : Text,
  ) : ?CatalogTypes.CouponInternal {
    let normalized = code.trim(#text(" ")).toUpper();
    coupons.values().find(func(coupon) = coupon.code.toUpper() == normalized);
  };
};
