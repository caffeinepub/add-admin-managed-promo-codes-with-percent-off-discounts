import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useCheckAdminAccess() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

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
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
    staleTime: 0, // Always refetch when invalidated
  });

  return {
    isAdmin: query.data === true,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    error: query.error,
    refetch: query.refetch,
  };
}
