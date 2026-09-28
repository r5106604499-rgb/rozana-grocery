import List "mo:core/List";
import Nat "mo:core/Nat";
import Common "../types/common";
import AccountTypes "../types/account";

module {
  /// List a customer's saved addresses.
  public func listAddresses(addresses : List.List<Common.SavedAddress>) : [Common.SavedAddress] {
    let views = addresses.values().toArray();
    views.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Add a saved address. Returns the new address id.
  public func addAddress(
    addresses : List.List<Common.SavedAddress>,
    state : AccountTypes.AccountState,
    address : Common.Address,
  ) : Common.AddressId {
    let id = state.nextAddressId;
    state.nextAddressId := id + 1;
    addresses.add({ id; address });
    id;
  };

  /// Update a saved address.
  public func updateAddress(
    addresses : List.List<Common.SavedAddress>,
    addressId : Common.AddressId,
    address : Common.Address,
  ) : Bool {
    switch (addresses.find(func(saved) = saved.id == addressId)) {
      case (?saved) {
        let snapshot = addresses.toArray();
        addresses.clear();
        for (entry in snapshot.values()) {
          if (entry.id == addressId) {
            addresses.add({ id = addressId; address });
          } else {
            addresses.add(entry);
          };
        };
        true;
      };
      case null { false };
    };
  };

  /// Delete a saved address.
  public func deleteAddress(
    addresses : List.List<Common.SavedAddress>,
    addressId : Common.AddressId,
  ) : Bool {
    var removed = false;
    let snapshot = addresses.toArray();
    addresses.clear();
    for (entry in snapshot.values()) {
      if (entry.id == addressId) {
        removed := true;
      } else {
        addresses.add(entry);
      };
    };
    removed;
  };

  /// List a customer's wishlist product ids.
  public func listWishlist(wishlist : List.List<Common.ProductId>) : [Common.ProductId] {
    wishlist.toArray();
  };

  /// Toggle a product in the wishlist. Returns true when now present.
  public func toggleWishlist(
    wishlist : List.List<Common.ProductId>,
    productId : Common.ProductId,
  ) : Bool {
    switch (wishlist.find(func(id) = id == productId)) {
      case (?_) {
        let snapshot = wishlist.toArray();
        wishlist.clear();
        for (id in snapshot.values()) {
          if (id != productId) {
            wishlist.add(id);
          };
        };
        false;
      };
      case null {
        wishlist.add(productId);
        true;
      };
    };
  };

  /// List a customer's notifications, newest first.
  public func listNotifications(
    notifications : List.List<AccountTypes.NotificationInternal>,
  ) : [Common.Notification] {
    let views = notifications.values().map(func(notification) = toNotification(notification));
    views.toArray().sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  /// Mark a notification as read.
  public func markNotificationRead(
    notifications : List.List<AccountTypes.NotificationInternal>,
    notificationId : Common.NotificationId,
  ) : Bool {
    switch (notifications.find(func(notification) = notification.id == notificationId)) {
      case (?notification) {
        let updated : AccountTypes.NotificationInternal = {
          id = notification.id;
          title = notification.title;
          body = notification.body;
          createdAt = notification.createdAt;
          read = true;
        };
        let snapshot = notifications.toArray();
        notifications.clear();
        for (entry in snapshot.values()) {
          if (entry.id == notificationId) {
            notifications.add(updated);
          } else {
            notifications.add(entry);
          };
        };
        true;
      };
      case null { false };
    };
  };

  /// Record a recently viewed product for a customer.
  public func recordRecentlyViewed(
    recentlyViewed : List.List<Common.ProductId>,
    productId : Common.ProductId,
  ) : () {
    // Remove any existing entry so the product moves to the front.
    let snapshot = recentlyViewed.toArray();
    recentlyViewed.clear();
    for (id in snapshot.values()) {
      if (id != productId) {
        recentlyViewed.add(id);
      };
    };
    recentlyViewed.add(productId);
    // Keep only the most recent 20 entries.
    let maxEntries = 20;
    if (recentlyViewed.size() > maxEntries) {
      let trimmed = recentlyViewed.toArray();
      recentlyViewed.clear();
      var index = 0;
      for (id in trimmed.values()) {
        if (index >= trimmed.size() - maxEntries) {
          recentlyViewed.add(id);
        };
        index += 1;
      };
    };
  };

  /// List a customer's recently viewed product ids, newest first.
  public func listRecentlyViewed(recentlyViewed : List.List<Common.ProductId>) : [Common.ProductId] {
    let views = recentlyViewed.toArray();
    views.reverse();
  };

  /// Convert an internal notification to its view.
  public func toNotification(self : AccountTypes.NotificationInternal) : Common.Notification {
    {
      id = self.id;
      title = self.title;
      body = self.body;
      createdAt = self.createdAt;
      read = self.read;
    };
  };
};
