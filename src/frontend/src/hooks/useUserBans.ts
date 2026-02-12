import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useGetBannedUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['bannedUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBannedUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCheckIfBanned(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isBanned', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return false;
      return actor.isBannedUser(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.banUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['isBanned'] });
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unbanUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['isBanned'] });
    },
  });
}
