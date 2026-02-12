import { useEffect, useRef } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook that automatically ensures the authenticated user has the #user role.
 * Runs once per authenticated principal and invalidates relevant caches on success.
 * Note: The backend automatically assigns roles, so this hook primarily handles cache invalidation.
 */
export function useEnsureUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const hasRunRef = useRef<string | null>(null);

  useEffect(() => {
    const ensureRole = async () => {
      // Only run if we have an authenticated actor and identity
      if (!actor || actorFetching || !identity || isInitializing) {
        return;
      }

      const principalString = identity.getPrincipal().toString();

      // Skip if already run successfully for this principal
      if (hasRunRef.current === principalString) {
        return;
      }

      try {
        // Mark as completed for this principal
        hasRunRef.current = principalString;

        // Invalidate and refetch relevant queries to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        await queryClient.invalidateQueries({ queryKey: ['isAdmin', principalString] });
        await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        
        // Force refetch to update UI immediately
        await queryClient.refetchQueries({ 
          queryKey: ['currentUserProfile'],
          exact: true 
        });
      } catch (error: any) {
        console.debug(
          '[ensureUserRole] Cache invalidation failed for principal:',
          principalString,
          'Error:',
          error?.message || String(error)
        );
      }
    };

    ensureRole();
  }, [actor, actorFetching, identity, isInitializing, queryClient]);

  // Reset when user logs out
  useEffect(() => {
    if (!identity) {
      hasRunRef.current = null;
    }
  }, [identity]);
}
