import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useCheckAdminAccess() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Try isCallerAdmin first (preferred method)
        return await actor.isCallerAdmin();
      } catch (error: any) {
        // If isCallerAdmin fails with authorization error, try isAdmin as fallback
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          try {
            return await actor.isAdmin();
          } catch (fallbackError: any) {
            // If both fail with authorization, user is not admin
            if (fallbackError?.message?.includes('Unauthorized') || fallbackError?.message?.includes('trap')) {
              return false;
            }
            throw fallbackError;
          }
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
