import Debug "mo:core/Debug";
import Common "common";

module {
  /// Internal notification record.
  public type NotificationInternal = {
    id : Common.NotificationId;
    title : Text;
    body : Text;
    createdAt : Common.Timestamp;
    read : Bool;
  };

  /// Mutable counters shared with the account mixin.
  public type AccountState = {
    var nextAddressId : Nat;
    var nextNotificationId : Nat;
  };

  /// Ignore helper kept so this module compiles as a pure type module.
  public func _unused() : () {
    ignore Debug;
  };
};
