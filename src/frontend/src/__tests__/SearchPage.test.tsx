import { SearchPage } from "@/pages/SearchPage";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "./harness";
import {
  actorState,
  createActorMock,
  makeCategory,
  makeProduct,
  resetHarness,
} from "./mockState";

const ROUTES = [
  { path: "/", component: () => <div>home page</div> },
  { path: "/search", component: SearchPage },
  { path: "/products/$productId", component: () => <div>product detail</div> },
];

describe("SearchPage", () => {
  it("searches by name and shows matching products", async () => {
    resetHarness();
    const rice = makeProduct({ id: 1n, name: "India Gate Basmati Rice" });
    const searchProducts = vi.fn(async () => [rice]);
    actorState.actor = createActorMock({
      listCategories: async () => [makeCategory()],
      searchProducts,
    });

    const { findByText, findAllByTestId } = renderWithProviders(
      ROUTES,
      "/search?q=Basmati%20Rice",
    );

    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect((await findAllByTestId("product_card")).length).toBe(1);
    expect(searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ searchTerm: "Basmati Rice" }),
    );
  });

  it("passes the category and max-price filters to the backend", async () => {
    resetHarness();
    const searchProducts = vi.fn(async () => [makeProduct()]);
    actorState.actor = createActorMock({
      listCategories: async () => [
        makeCategory({ id: 3n, name: "Dals & Pulses" }),
      ],
      searchProducts,
    });

    const { findByText } = renderWithProviders(
      ROUTES,
      "/search?q=dal&categoryId=3&maxPrice=5000",
    );

    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect(searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: "dal",
        categoryId: 3n,
        maxPrice: 5000n,
      }),
    );
  });

  it("restores filter state from the URL after a refresh", async () => {
    resetHarness();
    const searchProducts = vi.fn(async () => [makeProduct()]);
    actorState.actor = createActorMock({
      listCategories: async () => [
        makeCategory({ id: 3n, name: "Dals & Pulses" }),
      ],
      searchProducts,
    });

    // A fresh render at the same URL models a page refresh: the filter state
    // must come back from the query string, not from in-memory state.
    const { findByText } = renderWithProviders(
      ROUTES,
      "/search?q=dal&categoryId=3&maxPrice=5000&sort=price-asc",
    );

    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect(searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: "dal",
        categoryId: 3n,
        maxPrice: 5000n,
      }),
    );
  });

  it("shows an empty state when nothing matches", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      listCategories: async () => [makeCategory()],
      searchProducts: async () => [],
    });

    const { findByText } = renderWithProviders(ROUTES, "/search?q=zzzznothing");

    expect(await findByText("No products found")).toBeInTheDocument();
  });

  it("prompts for a term before any search runs", async () => {
    resetHarness();
    actorState.actor = createActorMock({
      listCategories: async () => [makeCategory()],
    });

    const { findByText } = renderWithProviders(ROUTES, "/search");

    expect(await findByText("Search groceries")).toBeInTheDocument();
  });
});
