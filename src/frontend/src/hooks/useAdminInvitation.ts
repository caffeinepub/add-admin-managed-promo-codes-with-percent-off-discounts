import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useCheckAdminInvitation() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['adminInvitation', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.checkAdminInvitation();
      } catch (error: any) {
        // If we get an authorization error early after login, treat it as retryable
        // This handles the case where the user role hasn't been assigned yet
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          // Check if this is a transient authorization issue vs. a definitive "no invitation"
          // If the error mentions "Only authenticated users", it's likely a timing issue
          if (error?.message?.includes('Only authenticated users')) {
            throw error; // Throw to trigger retry
          }
          // Otherwise, treat as no invitation
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: 3, // Retry up to 3 times to handle authorization timing
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s, 3s
    staleTime: 0,
  });

  return {
    hasInvitation: query.data === true,
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: !!actor && !isInitializing && query.isFetched,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAcceptAdminInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptAdminInvitation();
    },
    onSuccess: async () => {
      // Clear invitation query
      await queryClient.invalidateQueries({ queryKey: ['adminInvitation'] });
      
      // Invalidate and refetch admin status immediately
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

export function useDeclineAdminInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.declineAdminInvitation();
    },
    onSuccess: async () => {
      // Clear invitation query
      await queryClient.invalidateQueries({ queryKey: ['adminInvitation'] });
    },
  });
}
