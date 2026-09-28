import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import { vi } from "vitest";
import { actorState, identityState } from "./mockState";

// Radix UI primitives (Select, Slider) observe element size, which jsdom does
// not implement. A no-op observer is enough for the components to mount.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (!("ResizeObserver" in globalThis)) {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
    ResizeObserverStub;
}

// Generated components expose `data-ocid` hooks; make them queryable by test id
// without every test having to pass a custom attribute name.
configure({ testIdAttribute: "data-ocid" });

// The storefront reaches the backend and the Internet Identity session through
// this one package. Replacing it here keeps every page test on a local, typed
// actor mock instead of a real agent or network call.
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({
    actor: actorState.actor,
    isFetching: actorState.isFetching,
  }),
  useInternetIdentity: () => ({
    identity: identityState.isAuthenticated ? {} : undefined,
    login: identityState.login,
    clear: identityState.logout,
    loginStatus: identityState.isInitializing
      ? "initializing"
      : identityState.isLoggingIn
        ? "logging-in"
        : "idle",
    isInitializing: identityState.isInitializing,
    isLoginIdle: !identityState.isInitializing && !identityState.isLoggingIn,
    isLoggingIn: identityState.isLoggingIn,
    isLoginSuccess: false,
    isLoginError: false,
    isAuthenticated: identityState.isAuthenticated,
  }),
}));
