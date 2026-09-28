import Principal "mo:core/Principal";
import Common "common";

module {
  /// An order paired with the customer principal that placed it (admin view).
  public type AdminOrder = {
    customer : Principal;
    order : Common.Order;
  };

  /// Ignore helper kept so this module compiles as a pure type module.
  public func _unused() : () {
    ignore Principal;
  };
};
