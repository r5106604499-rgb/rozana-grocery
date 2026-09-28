import type {
  Address,
  AddressId,
  CartError,
  CartItemView,
  CartView,
  Category,
  CategoryId,
  CheckoutInput,
  Coupon,
  CouponId,
  CustomerSummary,
  HomeFeed,
  Notification,
  NotificationId,
  Order,
  OrderId,
  OrderLine,
  PackSize,
  Paise,
  Product,
  ProductFilter,
  ProductId,
  SalesSummary,
  SavedAddress,
  Timestamp,
  UserProfile,
} from "@/backend";

export type {
  Address,
  AddressId,
  CartError,
  CartItemView,
  CartView,
  Category,
  CategoryId,
  CheckoutInput,
  Coupon,
  CouponId,
  CustomerSummary,
  HomeFeed,
  Notification,
  NotificationId,
  Order,
  OrderId,
  OrderLine,
  PackSize,
  Paise,
  Product,
  ProductFilter,
  ProductId,
  SalesSummary,
  SavedAddress,
  Timestamp,
  UserProfile,
};

export { OrderStatus, PaymentMethod, UserRole } from "@/backend";
import { OrderStatus, PaymentMethod } from "@/backend";

/** A cart line joined with its product record for richer rendering. */
export interface CartLine {
  product: Product;
  quantity: number;
}

/** Delivery address draft used by the address form. */
export type AddressDraft = Address;

/** Empty address draft for new-address forms. */
export const EMPTY_ADDRESS: Address = {
  fullName: "",
  mobile: "",
  houseFlat: "",
  area: "",
  landmark: "",
  pincode: "",
  instructions: "",
};

/** Human-readable labels for order statuses. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.placed]: "Placed",
  [OrderStatus.confirmed]: "Confirmed",
  [OrderStatus.packing]: "Packing",
  [OrderStatus.outForDelivery]: "Out for delivery",
  [OrderStatus.delivered]: "Delivered",
};

/** Ordered pipeline used by the order tracker. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.placed,
  OrderStatus.confirmed,
  OrderStatus.packing,
  OrderStatus.outForDelivery,
  OrderStatus.delivered,
];

/** Human-readable labels for payment methods. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cod]: "Cash on delivery",
  [PaymentMethod.online]: "Pay online",
};
