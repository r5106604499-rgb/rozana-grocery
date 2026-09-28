import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  actor.setIdentity(alice);
  await expect(actor.listMyOrders()).resolves.toEqual([]);
  await expect(actor.listWishlist()).resolves.toEqual([]);
  await expect(actor.listAddresses()).resolves.toEqual([]);
  await expect(actor.listNotifications()).resolves.toEqual([]);
  await expect(actor.listRecentlyViewed()).resolves.toEqual([]);
  await expect(actor.getCart()).resolves.toMatchObject({ itemCount: 0n });
});

it("seeds the grocery catalog through the real canister", async () => {
  actor.setIdentity(alice);
  const categories = await actor.listCategories();
  expect(categories.length).toBe(27);
  expect(categories.map((category) => category.name)).toContain("Rice");

  const products = await actor.searchProducts({
    categoryId: [],
    inStockOnly: false,
    maxPrice: [],
    searchTerm: ["Basmati"],
    minPrice: [],
  });
  expect(products.length).toBeGreaterThan(0);
  expect(products[0]?.name).toContain("Basmati");
});

it("round-trips a cart and an order through the real canister", async () => {
  actor.setIdentity(alice);
  const products = await actor.searchProducts({
    categoryId: [],
    inStockOnly: false,
    maxPrice: [],
    searchTerm: ["Basmati"],
    minPrice: [],
  });
  const product = products[0];
  expect(product).toBeDefined();
  if (product === undefined) {
    return;
  }

  await actor.addToCart(product.id, 2n);
  const cart = await actor.getCart();
  expect(cart.itemCount).toBe(2n);
  expect(cart.items[0]?.productId).toBe(product.id);

  const orderId = await actor.placeOrder({
    couponCode: [],
    paymentMethod: { cod: null },
    address: {
      fullName: "Ananya Sharma",
      mobile: "9876543210",
      houseFlat: "Flat 4B",
      area: "Indiranagar",
      pincode: "560038",
      landmark: "Near Metro Station",
      instructions: "",
    },
  });

  const order = await actor.getMyOrder(orderId);
  expect(order).not.toEqual([]);
  expect(order[0]?.status).toEqual({ placed: null });
  expect(order[0]?.lines.length).toBe(1);
  expect(order[0]?.lines[0]?.quantity).toBe(2n);

  const orders = await actor.listMyOrders();
  expect(orders.map((entry) => entry.id)).toContain(orderId);
});

it("keeps one caller's cart and orders out of another's", async () => {
  actor.setIdentity(alice);
  const products = await actor.searchProducts({
    categoryId: [],
    inStockOnly: false,
    maxPrice: [],
    searchTerm: ["Basmati"],
    minPrice: [],
  });
  const product = products[0];
  expect(product).toBeDefined();
  if (product === undefined) {
    return;
  }
  await actor.addToCart(product.id, 1n);

  actor.setIdentity(bob);
  const bobCart = await actor.getCart();
  expect(bobCart.itemCount).toBe(0n);
  await expect(actor.listMyOrders()).resolves.toEqual([]);
});

it("rejects an anonymous caller from admin-only reads", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.adminListOrders()).rejects.toThrow();
});
