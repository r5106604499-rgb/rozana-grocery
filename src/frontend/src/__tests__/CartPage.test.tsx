import { CartPage } from "@/pages/CartPage";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "./harness";
import {
  actorState,
  createActorMock,
  makeCart,
  resetHarness,
} from "./mockState";

const ROUTES = [
  { path: "/", component: () => <div>home page</div> },
  { path: "/cart", component: CartPage },
  { path: "/checkout", component: () => <div>checkout page</div> },
  { path: "/products/$productId", component: () => <div>product detail</div> },
];

describe("CartPage", () => {
  it("shows line items, totals and the free-delivery hint", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
    });

    const { findAllByText, findByText, findByTestId } = renderWithProviders(
      ROUTES,
      "/cart",
    );

    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect((await findAllByText("₹90")).length).toBeGreaterThan(0);
    expect(await findByText("₹29")).toBeInTheDocument();
    expect(await findByTestId("cart.free_delivery_hint")).toHaveTextContent(
      "Add ₹409 more for free delivery",
    );
    expect(await findByTestId("cart.checkout_button")).toBeInTheDocument();
  });

  it("increments a line quantity through the backend", async () => {
    resetHarness();
    const user = userEvent.setup();
    const setCartQuantity = vi.fn(async () => ({
      __kind__: "invalidQuantity" as const,
      invalidQuantity: null,
    }));
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      setCartQuantity,
    });

    const { findByTestId } = renderWithProviders(ROUTES, "/cart");

    await user.click(await findByTestId("quantity_increment_button"));

    expect(setCartQuantity).toHaveBeenCalledWith(1n, 2n);
  });

  it("removes a line item through the backend", async () => {
    resetHarness();
    const user = userEvent.setup();
    const removeFromCart = vi.fn(async () => true);
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      removeFromCart,
    });

    const { findByTestId } = renderWithProviders(ROUTES, "/cart");

    await user.click(await findByTestId("cart.remove_button.1"));

    expect(removeFromCart).toHaveBeenCalledWith(1n);
  });

  it("applies a valid coupon and shows a confirmation", async () => {
    resetHarness();
    const user = userEvent.setup();
    const applyCoupon = vi.fn(async () => ({
      __kind__: "invalidQuantity" as const,
      invalidQuantity: null,
    }));
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      applyCoupon,
    });

    const { findByTestId, findByText } = renderWithProviders(ROUTES, "/cart");

    await user.type(await findByTestId("cart.coupon_input"), "SAVE50");
    await user.click(await findByTestId("cart.apply_coupon_button"));

    expect(await findByText(/Coupon "SAVE50" applied/)).toBeInTheDocument();
    expect(applyCoupon).toHaveBeenCalledWith("SAVE50");
  });

  it("shows an error message for an invalid coupon", async () => {
    resetHarness();
    const user = userEvent.setup();
    actorState.actor = createActorMock({
      getCart: async () => makeCart(),
      applyCoupon: async () => ({
        __kind__: "couponNotFound" as const,
        couponNotFound: "NOPE",
      }),
    });

    const { findByTestId, findByText } = renderWithProviders(ROUTES, "/cart");

    await user.type(await findByTestId("cart.coupon_input"), "NOPE");
    await user.click(await findByTestId("cart.apply_coupon_button"));

    expect(
      await findByText(/We couldn't find the code "NOPE"/),
    ).toBeInTheDocument();
  });

  it("shows an empty state when the cart has no items", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      getCart: async () =>
        makeCart({ items: [], itemCount: 0n, subtotal: 0n, total: 0n }),
    });

    const { findByText } = renderWithProviders(ROUTES, "/cart");

    expect(await findByText("Your cart is empty")).toBeInTheDocument();
  });
});
