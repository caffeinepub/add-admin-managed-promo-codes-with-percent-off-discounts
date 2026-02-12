import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * This hook is deprecated for admin panel access gating.
 * Admin panel access is now controlled by admin-panel session state.
 * This hook remains for backward compatibility with other parts of the app
 * that may still use role-based checks (e.g., ban/unban operations).
 */
export function useCheckAdminAccess() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Call isCallerAdmin method
        return await actor.isCallerAdmin();
      } catch (error: any) {
        // If fails with authorization error, user is not admin
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: 2, // Retry twice to handle timing issues
    retryDelay: 500, // Wait 500ms between retries
    staleTime: 0, // Always refetch when invalidated
  });

  // Return loading state that properly reflects all dependencies
  return {
    isAdmin: query.data === true,
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: !!actor && !isInitializing && query.isFetched,
    error: query.error,
    refetch: query.refetch,
  };
}
