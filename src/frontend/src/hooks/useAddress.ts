import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { Address, AddressId, SavedAddress } from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's saved addresses. */
export function useAddresses() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SavedAddress[]>({
    queryKey: QUERY_KEYS.addresses,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAddresses();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Add a saved address. */
export function useAddAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<AddressId, Error, Address>({
    mutationFn: async (address) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addAddress(address);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}

/** Update a saved address. */
export function useUpdateAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    { addressId: AddressId; address: Address }
  >({
    mutationFn: async ({ addressId, address }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateAddress(addressId, address);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}

/** Delete a saved address. */
export function useDeleteAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, AddressId>({
    mutationFn: async (addressId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteAddress(addressId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}
