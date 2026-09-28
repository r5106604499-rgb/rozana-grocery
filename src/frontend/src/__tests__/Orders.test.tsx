import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderStatus, PaymentMethod } from "@/types/app";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./harness";
import {
  actorState,
  createActorMock,
  identityState,
  makeOrder,
  resetHarness,
} from "./mockState";

const ROUTES = [
  { path: "/", component: () => <div>home page</div> },
  { path: "/orders", component: OrdersPage },
  { path: "/orders/$orderId", component: OrderDetailPage },
  {
    path: "/order-confirmation/$orderId",
    component: OrderConfirmationPage,
  },
];

describe("OrdersPage", () => {
  it("prompts signed-out visitors to sign in", async () => {
    resetHarness();
    actorState.actor = createActorMock();

    const { findByText } = renderWithProviders(ROUTES, "/orders");

    expect(await findByText("Sign in to see your orders")).toBeInTheDocument();
  });

  it("lists the signed-in user's orders with status and total", async () => {
    resetHarness();
    identityState.isAuthenticated = true;
    actorState.actor = createActorMock({
      listMyOrders: async () => [makeOrder()],
    });

    const { findByText, findByTestId } = renderWithProviders(ROUTES, "/orders");

    expect(await findByText("#42")).toBeInTheDocument();
    expect(await findByText("₹90")).toBeInTheDocument();
    expect(await findByTestId("order_item")).toBeInTheDocument();
  });

  it("shows an empty state when the user has no orders", async () => {
    resetHarness();
    identityState.isAuthenticated = true;
    actorState.actor = createActorMock({ listMyOrders: async () => [] });

    const { findByText } = renderWithProviders(ROUTES, "/orders");

    expect(await findByText("No orders yet")).toBeInTheDocument();
  });
});

describe("OrderConfirmationPage", () => {
  it("shows the order id, items, total, address, payment and status", async () => {
    resetHarness();
    identityState.isAuthenticated = true;
    actorState.actor = createActorMock({
      getMyOrder: async () => makeOrder(),
    });

    const { findByText, findByTestId } = renderWithProviders(
      ROUTES,
      "/order-confirmation/42",
    );

    expect(await findByTestId("order_confirmation_order_id")).toHaveTextContent(
      "#42",
    );
    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect(await findByTestId("order_confirmation_total")).toHaveTextContent(
      "₹90",
    );
    expect(await findByText("Ananya Sharma")).toBeInTheDocument();
    expect(
      await findByTestId("order_confirmation_payment_method"),
    ).toHaveTextContent("Cash on delivery");
    expect(await findByTestId("order_confirmation_status")).toHaveTextContent(
      "Order Placed",
    );
  });
});

describe("OrderDetailPage", () => {
  it("reflects an admin status change in the customer's order view", async () => {
    resetHarness();
    identityState.isAuthenticated = true;
    actorState.actor = createActorMock({
      getMyOrder: async () =>
        makeOrder({
          status: OrderStatus.outForDelivery,
          paymentMethod: PaymentMethod.online,
        }),
    });

    const { findAllByText, findByText } = renderWithProviders(
      ROUTES,
      "/orders/42",
    );

    expect((await findAllByText("Out for delivery")).length).toBeGreaterThan(0);
    expect(await findByText("Paid via")).toBeInTheDocument();
    expect(await findByText("Pay online")).toBeInTheDocument();
  });
});
