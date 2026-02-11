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
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: 0, // Always refetch when invalidated
  });

  return {
    isAdmin: query.data || false,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    error: query.error,
    refetch: query.refetch,
  };
}
