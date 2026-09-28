import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { UserRole } from "@/types/app";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./harness";
import {
  actorState,
  createActorMock,
  identityState,
  makeCategory,
  makeProduct,
  resetHarness,
} from "./mockState";

const ROUTES = [
  { path: "/", component: () => <div>home page</div> },
  { path: "/admin/products", component: AdminProductsPage },
];

describe("AdminGuard", () => {
  it("prompts signed-out visitors to sign in", async () => {
    resetHarness();
    actorState.actor = createActorMock();

    const { findByText } = renderWithProviders(ROUTES, "/admin/products");

    expect(await findByText("Admin sign-in required")).toBeInTheDocument();
  });

  it("denies a signed-in non-admin user", async () => {
    resetHarness();
    identityState.isAuthenticated = true;
    actorState.actor = createActorMock({
      getCallerUserRole: async () => UserRole.user,
      isCallerAdmin: async () => false,
    });

    const { findByText } = renderWithProviders(ROUTES, "/admin/products");

    expect(await findByText("Access denied")).toBeInTheDocument();
  });

  it("shows the product manager to an admin", async () => {
    resetHarness();
    identityState.isAuthenticated = true;
    actorState.actor = createActorMock({
      getCallerUserRole: async () => UserRole.admin,
      isCallerAdmin: async () => true,
      listCategories: async () => [makeCategory()],
      searchProducts: async () => [makeProduct()],
    });

    const { findByText, findByTestId } = renderWithProviders(
      ROUTES,
      "/admin/products",
    );

    expect(await findByText("India Gate Basmati Rice")).toBeInTheDocument();
    expect(await findByTestId("admin_add_product_button")).toBeInTheDocument();
  });
});
