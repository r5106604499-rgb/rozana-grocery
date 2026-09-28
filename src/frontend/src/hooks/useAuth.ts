import { createActor } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import type { UserProfile, UserRole } from "@/types/app";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Internet Identity session state plus the caller's backend role. */
export function useAuth() {
  const {
    identity,
    login,
    clear,
    loginStatus,
    isInitializing,
    isAuthenticated,
    isLoggingIn,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);

  const roleQuery = useQuery<UserRole>({
    queryKey: QUERY_KEYS.userRole,
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });

  const isAdminQuery = useQuery<boolean>({
    queryKey: QUERY_KEYS.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });

  return {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginStatus,
    login,
    logout: clear,
    role: roleQuery.data ?? ("guest" as UserRole),
    isAdmin: isAdminQuery.data ?? false,
    isRoleLoading: roleQuery.isLoading || isAdminQuery.isLoading,
  };
}

/** The caller's saved profile. */
export function useUserProfile() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  return useQuery<UserProfile | null>({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

/** Save the caller's profile. */
export function useSaveUserProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
}

/** The caller's verified email, when available. */
export function useCallerEmail() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  return useQuery<string | null>({
    queryKey: QUERY_KEYS.callerEmail,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerEmail();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}
