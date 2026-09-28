import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Common "../types/common";
import CatalogTypes "../types/catalog";
import CartTypes "../types/cart";
import CartLib "cart";

module {
  /// Build the aggregate sales summary for the admin dashboard.
  public func salesSummary(
    orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>,
    products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
    customers : Map.Map<Principal, Common.UserProfile>,
  ) : Common.SalesSummary {
    var totalOrders = 0;
    var totalRevenue = 0;
    var placed = 0;
    var confirmed = 0;
    var packing = 0;
    var outForDelivery = 0;
    var delivered = 0;

    for (customerOrders in orders.values()) {
      for (order in customerOrders.values()) {
        totalOrders += 1;
        totalRevenue += order.total;
        switch (order.status) {
          case (#placed) { placed += 1 };
          case (#confirmed) { confirmed += 1 };
          case (#packing) { packing += 1 };
          case (#outForDelivery) { outForDelivery += 1 };
          case (#delivered) { delivered += 1 };
        };
      };
    };

    {
      totalOrders;
      totalRevenue;
      totalProducts = products.size();
      totalCustomers = customers.size();
      ordersByStatus = [
        ("Order Placed", placed),
        ("Order Confirmed", confirmed),
        ("Packing", packing),
        ("Out for Delivery", outForDelivery),
        ("Delivered", delivered),
      ];
    };
  };

  /// List all orders across all customers, newest first.
  public func listAllOrders(
    orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>,
  ) : [(Principal, Common.Order)] {
    let collected = List.empty<(Principal, Common.Order)>();
    for ((customer, customerOrders) in orders.entries()) {
      for (order in customerOrders.values()) {
        collected.add((customer, order.toOrder()));
      };
    };
    let views = collected.toArray();
    views.sort(func(a, b) = Nat.compare(b.1.id, a.1.id));
  };

  /// Change an order's status (admin).
  public func setOrderStatus(
    orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>,
    customer : Principal,
    orderId : Common.OrderId,
    status : Common.OrderStatus,
  ) : Bool {
    switch (orders.get(customer)) {
      case (?customerOrders) {
        switch (customerOrders.find(func(order) = order.id == orderId)) {
          case (?order) {
            let updated : CartTypes.OrderInternal = {
              id = order.id;
              lines = order.lines;
              subtotal = order.subtotal;
              discountTotal = order.discountTotal;
              deliveryCharge = order.deliveryCharge;
              couponCode = order.couponCode;
              couponDiscount = order.couponDiscount;
              total = order.total;
              address = order.address;
              paymentMethod = order.paymentMethod;
              status;
              placedAt = order.placedAt;
              updatedAt = Time.now();
            };
            let snapshot = customerOrders.toArray();
            customerOrders.clear();
            for (entry in snapshot.values()) {
              if (entry.id == orderId) {
                customerOrders.add(updated);
              } else {
                customerOrders.add(entry);
              };
            };
            true;
          };
          case null { false };
        };
      };
      case null { false };
    };
  };

  /// List customer summaries for the admin panel.
  public func listCustomers(
    customers : Map.Map<Principal, Common.UserProfile>,
    orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>,
  ) : [Common.CustomerSummary] {
    let summaries = customers.entries().map(
      func((principal, profile)) {
        var orderCount = 0;
        var totalSpent = 0;
        switch (orders.get(principal)) {
          case (?customerOrders) {
            for (order in customerOrders.values()) {
              orderCount += 1;
              totalSpent += order.total;
            };
          };
          case null {};
        };
        {
          principal;
          name = profile.name;
          email = profile.email;
          orderCount;
          totalSpent;
        };
      }
    );
    summaries.toArray();
  };
};
