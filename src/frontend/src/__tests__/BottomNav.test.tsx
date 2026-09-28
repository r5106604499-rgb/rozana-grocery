import { BottomNav } from "@/components/BottomNav";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./harness";
import { resetHarness } from "./mockState";

const ROUTES = [
  { path: "/", component: () => <BottomNav cartCount={3} /> },
  { path: "/categories", component: () => <div>categories page</div> },
  { path: "/cart", component: () => <div>cart page</div> },
  { path: "/orders", component: () => <div>orders page</div> },
  { path: "/profile", component: () => <div>profile page</div> },
];

describe("BottomNav", () => {
  it("shows the five primary destinations", async () => {
    resetHarness();

    const { findByTestId, findByText } = renderWithProviders(ROUTES, "/");

    expect(await findByTestId("bottom_nav")).toBeInTheDocument();
    expect(await findByText("Home")).toBeInTheDocument();
    expect(await findByText("Categories")).toBeInTheDocument();
    expect(await findByText("Cart")).toBeInTheDocument();
    expect(await findByText("Orders")).toBeInTheDocument();
    expect(await findByText("Profile")).toBeInTheDocument();
  });

  it("marks the active tab and shows the cart badge", async () => {
    resetHarness();

    const { findByTestId } = renderWithProviders(ROUTES, "/");

    expect(await findByTestId("nav_home_link")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await findByTestId("nav_cart_link")).toHaveTextContent("3");
  });
});
