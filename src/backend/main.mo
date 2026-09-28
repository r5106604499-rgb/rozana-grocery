import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Common "types/common";
import CatalogTypes "types/catalog";
import CartTypes "types/cart";
import AccountTypes "types/account";
import CatalogApi "mixins/catalog-api";
import CartApi "mixins/cart-api";
import AccountApi "mixins/account-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // ---- Stable state (initial values supplied by the migration chain) ----

  let accessControlState : AccessControl.AccessControlState;

  let products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>;
  let categories : Map.Map<Common.CategoryId, CatalogTypes.CategoryInternal>;
  let coupons : Map.Map<Common.CouponId, CatalogTypes.CouponInternal>;
  let catalogState : CatalogTypes.CatalogState;

  let carts : Map.Map<Principal, List.List<Common.CartLine>>;
  let cartCoupons : Map.Map<Principal, Text>;
  let orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>;
  let cartState : CartTypes.CartState;

  let profiles : Map.Map<Principal, Common.UserProfile>;
  let emails : Map.Map<Principal, Text>;
  let addresses : Map.Map<Principal, List.List<Common.SavedAddress>>;
  let wishlists : Map.Map<Principal, List.List<Common.ProductId>>;
  let recentlyViewed : Map.Map<Principal, List.List<Common.ProductId>>;
  let notifications : Map.Map<Principal, List.List<AccountTypes.NotificationInternal>>;
  let accountState : AccountTypes.AccountState;

  // ---- Authorization ----

  include MixinAuthorization(
    accessControlState,
    ?(func(caller : Principal, attrs : { name : ?Text; email : ?Text; sso : ?Text }) {
      switch (attrs.email) {
        case (?email) { emails.add(caller, email) };
        case null {};
      };
    }),
  );

  // ---- Domain APIs ----

  include CatalogApi(accessControlState, products, categories, coupons, catalogState);
  include CartApi(accessControlState, products, coupons, carts, cartCoupons, orders, cartState);
  include AccountApi(accessControlState, profiles, emails, addresses, wishlists, recentlyViewed, notifications, accountState);
  include AdminApi(accessControlState, products, orders, profiles);

  // ---- Behavioral API documentation ----

  include ApiDocMixin();

  // ---- OQL exposure ----

  // Flatten the per-customer order map into one row per order, promoting the
  // map key (the customer principal) to an owner column.
  func orderRows() : Iter.Iter<(Principal, CartTypes.OrderInternal)> {
    orders.entries().flatMap(
      func((customer, list)) = list.values().map(func(order) = (customer, order))
    );
  };

  // Flatten the per-customer cart map into one row per cart line, promoting the
  // map key (the customer principal) to an owner column.
  func cartRows() : Iter.Iter<(Principal, Common.CartLine)> {
    carts.entries().flatMap(
      func((customer, list)) = list.values().map(func(line) = (customer, line))
    );
  };

  // Flatten the per-customer saved-address map into one row per address.
  func addressRows() : Iter.Iter<(Principal, Common.SavedAddress)> {
    addresses.entries().flatMap(
      func((customer, list)) = list.values().map(func(address) = (customer, address))
    );
  };

  // Flatten the per-customer wishlist map into one row per wishlisted product.
  func wishlistRows() : Iter.Iter<(Principal, Common.ProductId)> {
    wishlists.entries().flatMap(
      func((customer, list)) = list.values().map(func(productId) = (customer, productId))
    );
  };

  // Flatten the per-customer recently-viewed map into one row per product.
  func recentlyViewedRows() : Iter.Iter<(Principal, Common.ProductId)> {
    recentlyViewed.entries().flatMap(
      func((customer, list)) = list.values().map(func(productId) = (customer, productId))
    );
  };

  // Flatten the per-customer notification map into one row per notification.
  func notificationRows() : Iter.Iter<(Principal, AccountTypes.NotificationInternal)> {
    notifications.entries().flatMap(
      func((customer, list)) = list.values().map(func(notification) = (customer, notification))
    );
  };

  include Expose({
    entities = [
      products.toEntity("product", "Product", "id")
        .sample({
          id = 0;
          categoryId = 0;
          name = "";
          brand = "";
          packSize = "";
          imageUrl = "";
          originalPrice = 0;
          discountPrice = 0;
          stockQuantity = 0;
          description = "";
          createdAt = 0;
        })
        .public_()
        .build(),
      categories.toEntity("category", "Category", "id")
        .sample({ id = 0; name = ""; imageUrl = "" })
        .public_()
        .build(),
      coupons.toEntity("coupon", "Coupon", "id")
        .sample({
          id = 0;
          code = "";
          description = "";
          discountPercent = 0;
          minOrderValue = 0;
          maxDiscount = 0;
          active = false;
        })
        .controllerOnly()
        .build(),
      // Orders: one row per order, owned by the customer principal.
      OQL.Entity.manual<(Principal, CartTypes.OrderInternal)>("order", orderRows, "Order", "id")
        .sample((
          Principal.fromText("aaaaa-aa"),
          {
            id = 0;
            lines = [];
            subtotal = 0;
            discountTotal = 0;
            deliveryCharge = 0;
            couponCode = null;
            couponDiscount = 0;
            total = 0;
            address = {
              fullName = "";
              mobile = "";
              houseFlat = "";
              area = "";
              pincode = "";
              landmark = "";
              instructions = "";
            };
            paymentMethod = #cod;
            status = #placed;
            placedAt = 0;
            updatedAt = 0;
          },
        ))
        .payload("customer", func((customer, _)) = customer)
        .payload("id", func((_, order)) = order.id)
        .payload("subtotal", func((_, order)) = order.subtotal)
        .payload("discountTotal", func((_, order)) = order.discountTotal)
        .payload("deliveryCharge", func((_, order)) = order.deliveryCharge)
        .payload("couponCode", func((_, order)) = order.couponCode ?? "")
        .payload("couponDiscount", func((_, order)) = order.couponDiscount)
        .payload("total", func((_, order)) = order.total)
        .payload("paymentMethod", func((_, order)) =
          switch (order.paymentMethod) { case (#cod) "cod"; case (#online) "online" })
        .payload("status", func((_, order)) =
          switch (order.status) {
            case (#placed) "placed";
            case (#confirmed) "confirmed";
            case (#packing) "packing";
            case (#outForDelivery) "outForDelivery";
            case (#delivered) "delivered";
          })
        .payload("placedAt", func((_, order)) = order.placedAt)
        .payload("updatedAt", func((_, order)) = order.updatedAt)
        .payload("lineCount", func((_, order)) = order.lines.size())
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
      // Cart lines: one row per line, owned by the customer principal.
      OQL.Entity.manual<(Principal, Common.CartLine)>("cartLine", cartRows, "CartLine", "productId")
        .sample((Principal.fromText("aaaaa-aa"), { productId = 0; quantity = 0 }))
        .payload("customer", func((customer, _)) = customer)
        .payload("productId", func((_, line)) = line.productId)
        .payload("quantity", func((_, line)) = line.quantity)
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
      // Saved addresses: one row per address, owned by the customer principal.
      OQL.Entity.manual<(Principal, Common.SavedAddress)>("address", addressRows, "Address", "id")
        .sample((
          Principal.fromText("aaaaa-aa"),
          {
            id = 0;
            address = {
              fullName = "";
              mobile = "";
              houseFlat = "";
              area = "";
              pincode = "";
              landmark = "";
              instructions = "";
            };
          },
        ))
        .payload("customer", func((customer, _)) = customer)
        .payload("id", func((_, saved)) = saved.id)
        .payload("fullName", func((_, saved)) = saved.address.fullName)
        .payload("mobile", func((_, saved)) = saved.address.mobile)
        .payload("houseFlat", func((_, saved)) = saved.address.houseFlat)
        .payload("area", func((_, saved)) = saved.address.area)
        .payload("pincode", func((_, saved)) = saved.address.pincode)
        .payload("landmark", func((_, saved)) = saved.address.landmark)
        .payload("instructions", func((_, saved)) = saved.address.instructions)
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
      // Wishlist entries: one row per wishlisted product, owned by the customer.
      OQL.Entity.manual<(Principal, Common.ProductId)>("wishlist", wishlistRows, "WishlistEntry", "productId")
        .sample((Principal.fromText("aaaaa-aa"), 0))
        .payload("customer", func((customer, _)) = customer)
        .payload("productId", func((_, productId)) = productId)
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
      // Recently viewed entries: one row per product, owned by the customer.
      OQL.Entity.manual<(Principal, Common.ProductId)>("recentlyViewed", recentlyViewedRows, "RecentlyViewedEntry", "productId")
        .sample((Principal.fromText("aaaaa-aa"), 0))
        .payload("customer", func((customer, _)) = customer)
        .payload("productId", func((_, productId)) = productId)
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
      // Notifications: one row per notification, owned by the customer.
      OQL.Entity.manual<(Principal, AccountTypes.NotificationInternal)>("notification", notificationRows, "Notification", "id")
        .sample((
          Principal.fromText("aaaaa-aa"),
          { id = 0; title = ""; body = ""; createdAt = 0; read = false },
        ))
        .payload("customer", func((customer, _)) = customer)
        .payload("id", func((_, notification)) = notification.id)
        .payload("title", func((_, notification)) = notification.title)
        .payload("body", func((_, notification)) = notification.body)
        .payload("createdAt", func((_, notification)) = notification.createdAt)
        .payload("read", func((_, notification)) = notification.read)
        .ownedBy("customer")
        .controllerOrScoped()
        .build(),
      // User profiles: one row per customer, owned by the customer principal.
      OQL.Entity.manual<(Principal, Common.UserProfile)>("userProfile", func () = profiles.entries(), "UserProfile", "principal")
        .sample((Principal.fromText("aaaaa-aa"), { name = ""; email = null }))
        .payload("principal", func((principal, _)) = principal)
        .payload("name", func((_, profile)) = profile.name)
        .payload("email", func((_, profile)) = profile.email ?? "")
        .ownedBy("principal")
        .controllerOrScoped()
        .build(),
    ];
  });
};
