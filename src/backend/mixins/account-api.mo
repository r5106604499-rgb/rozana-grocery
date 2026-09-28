import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import AccountTypes "../types/account";
import AccountLib "../lib/account";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Common.UserProfile>,
  emails : Map.Map<Principal, Text>,
  addresses : Map.Map<Principal, List.List<Common.SavedAddress>>,
  wishlists : Map.Map<Principal, List.List<Common.ProductId>>,
  recentlyViewed : Map.Map<Principal, List.List<Common.ProductId>>,
  notifications : Map.Map<Principal, List.List<AccountTypes.NotificationInternal>>,
  accountState : AccountTypes.AccountState,
) {
  /// Fetch (creating if needed) a caller's saved address list.
  func callerAddresses(caller : Principal) : List.List<Common.SavedAddress> {
    switch (addresses.get(caller)) {
      case (?list) { list };
      case null {
        let list = List.empty<Common.SavedAddress>();
        addresses.add(caller, list);
        list;
      };
    };
  };

  /// Fetch (creating if needed) a caller's wishlist.
  func callerWishlist(caller : Principal) : List.List<Common.ProductId> {
    switch (wishlists.get(caller)) {
      case (?list) { list };
      case null {
        let list = List.empty<Common.ProductId>();
        wishlists.add(caller, list);
        list;
      };
    };
  };

  /// Fetch (creating if needed) a caller's recently viewed list.
  func callerRecentlyViewed(caller : Principal) : List.List<Common.ProductId> {
    switch (recentlyViewed.get(caller)) {
      case (?list) { list };
      case null {
        let list = List.empty<Common.ProductId>();
        recentlyViewed.add(caller, list);
        list;
      };
    };
  };

  /// Fetch (creating if needed) a caller's notifications.
  func callerNotifications(caller : Principal) : List.List<AccountTypes.NotificationInternal> {
    switch (notifications.get(caller)) {
      case (?list) { list };
      case null {
        let list = List.empty<AccountTypes.NotificationInternal>();
        notifications.add(caller, list);
        list;
      };
    };
  };

  /// Get the caller's profile.
  public query ({ caller }) func getCallerUserProfile() : async ?Common.UserProfile {
    profiles.get(caller);
  };

  /// Save the caller's profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : Common.UserProfile) : async () {
    profiles.add(caller, profile);
  };

  /// Get the caller's verified email, when available.
  public query ({ caller }) func getCallerEmail() : async ?Text {
    emails.get(caller);
  };

  /// List the caller's saved addresses.
  public query ({ caller }) func listAddresses() : async [Common.SavedAddress] {
    switch (addresses.get(caller)) {
      case (?list) { AccountLib.listAddresses(list) };
      case null { [] };
    };
  };

  /// Add a saved address.
  public shared ({ caller }) func addAddress(address : Common.Address) : async Common.AddressId {
    let list = callerAddresses(caller);
    AccountLib.addAddress(list, accountState, address);
  };

  /// Update a saved address.
  public shared ({ caller }) func updateAddress(addressId : Common.AddressId, address : Common.Address) : async Bool {
    let list = callerAddresses(caller);
    AccountLib.updateAddress(list, addressId, address);
  };

  /// Delete a saved address.
  public shared ({ caller }) func deleteAddress(addressId : Common.AddressId) : async Bool {
    let list = callerAddresses(caller);
    AccountLib.deleteAddress(list, addressId);
  };

  /// List the caller's wishlist product ids.
  public query ({ caller }) func listWishlist() : async [Common.ProductId] {
    switch (wishlists.get(caller)) {
      case (?list) { AccountLib.listWishlist(list) };
      case null { [] };
    };
  };

  /// Toggle a product in the caller's wishlist. Returns true when now present.
  public shared ({ caller }) func toggleWishlist(productId : Common.ProductId) : async Bool {
    let list = callerWishlist(caller);
    AccountLib.toggleWishlist(list, productId);
  };

  /// List the caller's notifications, newest first.
  public query ({ caller }) func listNotifications() : async [Common.Notification] {
    switch (notifications.get(caller)) {
      case (?list) { AccountLib.listNotifications(list) };
      case null { [] };
    };
  };

  /// Mark a notification as read.
  public shared ({ caller }) func markNotificationRead(notificationId : Common.NotificationId) : async Bool {
    let list = callerNotifications(caller);
    AccountLib.markNotificationRead(list, notificationId);
  };

  /// Record a product as recently viewed by the caller.
  public shared ({ caller }) func recordRecentlyViewed(productId : Common.ProductId) : async () {
    let list = callerRecentlyViewed(caller);
    AccountLib.recordRecentlyViewed(list, productId);
  };

  /// List the caller's recently viewed product ids, newest first.
  public query ({ caller }) func listRecentlyViewed() : async [Common.ProductId] {
    switch (recentlyViewed.get(caller)) {
      case (?list) { AccountLib.listRecentlyViewed(list) };
      case null { [] };
    };
  };
};
