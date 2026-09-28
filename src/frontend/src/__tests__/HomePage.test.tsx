import { HomePage } from "@/pages/HomePage";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./harness";
import {
  actorState,
  createActorMock,
  makeCategory,
  makeProduct,
  resetHarness,
} from "./mockState";

const ROUTES = [
  { path: "/", component: HomePage },
  { path: "/categories", component: () => <div>categories page</div> },
  {
    path: "/categories/$categoryId",
    component: () => <div>category detail</div>,
  },
  { path: "/search", component: () => <div>search page</div> },
  { path: "/products/$productId", component: () => <div>product detail</div> },
  { path: "/addresses", component: () => <div>addresses page</div> },
];

describe("HomePage", () => {
  it("renders the search placeholder, categories and product sections", async () => {
    resetHarness();
    const rice = makeProduct({ id: 1n, name: "India Gate Basmati Rice" });
    const atta = makeProduct({
      id: 2n,
      name: "Aashirvaad Whole Wheat Atta",
      brand: "Aashirvaad",
      categoryId: 2n,
    });
    actorState.actor = createActorMock({
      listCategories: async () => [
        makeCategory({ id: 1n, name: "Rice & Atta" }),
        makeCategory({ id: 2n, name: "Dals & Pulses" }),
      ],
      getHomeFeeds: async () => ({
        bestSelling: [rice],
        recommended: [atta],
        discounted: [rice],
        newArrivals: [atta],
        todaysDeals: [rice],
      }),
    });

    const { findAllByTestId, findByTestId, findAllByText } =
      renderWithProviders(ROUTES, "/");

    expect(await findByTestId("home_search_input")).toHaveAttribute(
      "placeholder",
      "Search for rice, atta, biscuits...",
    );
    expect((await findAllByText("Rice & Atta")).length).toBeGreaterThan(0);
    expect((await findAllByText("Today's Deals")).length).toBeGreaterThan(0);
    expect((await findAllByText("Best Selling")).length).toBeGreaterThan(0);
    expect((await findAllByText("New Arrivals")).length).toBeGreaterThan(0);
    expect((await findAllByText("Discount Section")).length).toBeGreaterThan(0);
    expect((await findAllByText("Recommended")).length).toBeGreaterThan(0);

    const cards = await findAllByTestId("product_card");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("shows a product card with brand, pack size, prices and discount", async () => {
    resetHarness();
    const rice = makeProduct({
      id: 1n,
      name: "India Gate Basmati Rice",
      brand: "India Gate",
      packSize: "5 kg",
      originalPrice: 12000n,
      discountPrice: 9000n,
      discountPercent: 25n,
    });
    actorState.actor = createActorMock({
      listCategories: async () => [makeCategory()],
      getHomeFeeds: async () => ({
        bestSelling: [rice],
        recommended: [],
        discounted: [],
        newArrivals: [],
        todaysDeals: [],
      }),
    });

    const { findByText, findByTestId } = renderWithProviders(ROUTES, "/");

    expect(await findByText("India Gate")).toBeInTheDocument();
    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect(await findByText("5 kg")).toBeInTheDocument();
    expect(await findByText("₹90")).toBeInTheDocument();
    expect(await findByText("₹120")).toBeInTheDocument();
    expect(await findByText("25% OFF")).toBeInTheDocument();
    expect(await findByTestId("add_to_cart_button")).toBeInTheDocument();
    expect(await findByTestId("wishlist_toggle_button")).toBeInTheDocument();
  });

  it("shows an empty state when a feed has no products", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      listCategories: async () => [makeCategory()],
      getHomeFeeds: async () => ({
        bestSelling: [],
        recommended: [],
        discounted: [],
        newArrivals: [],
        todaysDeals: [],
      }),
    });

    const { findByText } = renderWithProviders(ROUTES, "/");

    expect(await findByText("No today's deals yet")).toBeInTheDocument();
  });

  it("shows an error state when the home feed fails", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      listCategories: async () => [makeCategory()],
      getHomeFeeds: async () => {
        throw new Error("network down");
      },
    });

    const { findByText } = renderWithProviders(ROUTES, "/");

    expect(await findByText("Couldn't load products")).toBeInTheDocument();
  });
});
