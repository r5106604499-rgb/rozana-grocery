import { CheckoutPage } from "@/pages/CheckoutPage";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "./harness";
import {
  actorState,
  createActorMock,
  makeAddress,
  makeCart,
  resetHarness,
} from "./mockState";

const ROUTES = [
  { path: "/", component: () => <div>home page</div> },
  { path: "/cart", component: () => <div>cart page</div> },
  { path: "/checkout", component: CheckoutPage },
  {
    path: "/order-confirmation/$orderId",
    component: () => <div>order confirmation page</div>,
  },
];

describe("CheckoutPage", () => {
  it("blocks submission and shows inline errors for invalid fields", async () => {
    resetHarness();
    const user = userEvent.setup();
    const placeOrder = vi.fn(async () => 42n);
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      listAddresses: async () => [],
      placeOrder,
    });

    const { findByTestId, findByText } = renderWithProviders(
      ROUTES,
      "/checkout",
    );

    await user.click(await findByTestId("checkout_place_order_button"));

    expect(await findByText("Enter the customer name")).toBeInTheDocument();
    expect(await findByText("Enter a mobile number")).toBeInTheDocument();
    expect(
      await findByText("Enter your house or flat number"),
    ).toBeInTheDocument();
    expect(await findByText("Enter your area or locality")).toBeInTheDocument();
    expect(await findByText("Enter a pincode")).toBeInTheDocument();
    expect(placeOrder).not.toHaveBeenCalled();
  });

  it("rejects a malformed mobile number and pincode", async () => {
    resetHarness();
    const user = userEvent.setup();
    const placeOrder = vi.fn(async () => 42n);
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      listAddresses: async () => [],
      placeOrder,
    });

    const { findByTestId, findByText } = renderWithProviders(
      ROUTES,
      "/checkout",
    );

    await user.type(await findByTestId("checkout_name_input"), "Ananya Sharma");
    await user.type(await findByTestId("checkout_mobile_input"), "12345");
    await user.type(await findByTestId("checkout_house_input"), "Flat 4B");
    await user.type(await findByTestId("checkout_area_input"), "Indiranagar");
    await user.type(await findByTestId("checkout_pincode_input"), "123");
    await user.click(await findByTestId("checkout_place_order_button"));

    expect(
      await findByText("Enter a valid 10-digit mobile number"),
    ).toBeInTheDocument();
    expect(
      await findByText("Enter a valid 6-digit pincode"),
    ).toBeInTheDocument();
    expect(placeOrder).not.toHaveBeenCalled();
  });

  it("places an order with the chosen payment method and navigates on success", async () => {
    resetHarness();
    const user = userEvent.setup();
    const placeOrder = vi.fn(async () => 42n);
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      listAddresses: async () => [],
      placeOrder,
    });

    const { findByTestId, findByText } = renderWithProviders(
      ROUTES,
      "/checkout",
    );

    await user.type(await findByTestId("checkout_name_input"), "Ananya Sharma");
    await user.type(await findByTestId("checkout_mobile_input"), "9876543210");
    await user.type(await findByTestId("checkout_house_input"), "Flat 4B");
    await user.type(await findByTestId("checkout_area_input"), "Indiranagar");
    await user.type(await findByTestId("checkout_pincode_input"), "560038");
    await user.click(await findByTestId("checkout_payment_online"));
    await user.click(await findByTestId("checkout_place_order_button"));

    expect(await findByText("order confirmation page")).toBeInTheDocument();
    expect(placeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: "online",
        address: expect.objectContaining({
          fullName: "Ananya Sharma",
          mobile: "9876543210",
          pincode: "560038",
        }),
      }),
    );
  });

  it("prefills the form from a saved address", async () => {
    resetHarness();
    const user = userEvent.setup();
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      listAddresses: async () => [
        { id: 7n, address: makeAddress({ fullName: "Ravi Kumar" }) },
      ],
    });

    const { findByTestId } = renderWithProviders(ROUTES, "/checkout");

    await user.click(await findByTestId("checkout_saved_address_item"));

    expect(await findByTestId("checkout_name_input")).toHaveValue("Ravi Kumar");
    expect(await findByTestId("checkout_pincode_input")).toHaveValue("560038");
  });

  it("shows an empty state when the cart is empty", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      getCart: async () =>
        makeCart({ items: [], itemCount: 0n, subtotal: 0n, total: 0n }),
      listAddresses: async () => [],
    });

    const { findByText } = renderWithProviders(ROUTES, "/checkout");

    expect(await findByText("Your cart is empty")).toBeInTheDocument();
  });
});
