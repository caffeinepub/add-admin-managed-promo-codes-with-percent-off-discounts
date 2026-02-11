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
        return await actor.isCallerAdmin();
      } catch (error: any) {
        // Handle backend trap errors gracefully
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: 1,
    staleTime: 0, // Always refetch when invalidated
  });

  // Return loading state that properly reflects all dependencies
  // isLoading should be true while actor is fetching, II is initializing, or query is loading
  // isFetched should only be true after a successful check has been performed
  return {
    isAdmin: query.data === true,
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: !!actor && !isInitializing && query.isFetched,
    error: query.error,
    refetch: query.refetch,
  };
}
