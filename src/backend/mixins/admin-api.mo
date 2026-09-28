import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CatalogTypes "../types/catalog";
import CartTypes "../types/cart";
import AdminLib "../lib/admin";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, CatalogTypes.ProductInternal>,
  orders : Map.Map<Principal, List.List<CartTypes.OrderInternal>>,
  profiles : Map.Map<Principal, Common.UserProfile>,
) {
  /// Aggregate sales figures (admin only).
  public query ({ caller }) func adminSalesSummary() : async Common.SalesSummary {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    AdminLib.salesSummary(orders, products, profiles);
  };

  /// List all orders across customers (admin only).
  public query ({ caller }) func adminListOrders() : async [(Principal, Common.Order)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    AdminLib.listAllOrders(orders);
  };

  /// Change an order's status (admin only).
  public shared ({ caller }) func adminSetOrderStatus(customer : Principal, orderId : Common.OrderId, status : Common.OrderStatus) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    AdminLib.setOrderStatus(orders, customer, orderId, status);
  };

  /// List customer summaries (admin only).
  public query ({ caller }) func adminListCustomers() : async [Common.CustomerSummary] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin role required");
    };
    AdminLib.listCustomers(profiles, orders);
  };
};
