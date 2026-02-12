import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: async () => {
      // Invalidate profile query
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      
      // Invalidate and refetch admin check with principal-scoped key
      const principalKey = identity?.getPrincipal().toString();
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      if (principalKey) {
        await queryClient.invalidateQueries({ queryKey: ['isAdmin', principalKey] });
      }
      
      // Force immediate refetch of admin status
      await queryClient.refetchQueries({ 
        queryKey: ['isAdmin'],
        exact: false 
      });
    },
  });
}
