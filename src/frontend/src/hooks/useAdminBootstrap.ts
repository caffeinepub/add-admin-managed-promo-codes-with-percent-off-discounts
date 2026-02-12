import { useEffect, useRef } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

// The designated bootstrap admin principal
const BOOTSTRAP_ADMIN_PRINCIPAL = 'jpmy2-7y5t4-jv5ee-rzfvm-562pu-czjjc-zj4oz-ohmp2-6h3al-3az2q-7qe';

/**
 * Hook that automatically bootstraps the designated admin principal after login.
 * This hook:
 * 1. Checks if the current principal matches the designated admin principal
 * 2. Attempts to call assignAdminRoleToCaller() once per session
 * 3. Invalidates admin-related queries on success to refresh UI
 * 4. Suppresses errors to avoid breaking non-admin logins
 */
export function useAdminBootstrap() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const bootstrapAttempted = useRef(false);

  useEffect(() => {
    // Only attempt bootstrap once per session
    if (bootstrapAttempted.current) return;
    
    // Wait for both identity and actor to be ready
    if (!identity || !actor) return;

    const currentPrincipal = identity.getPrincipal().toString();
    
    // Only attempt bootstrap if current principal matches the designated admin
    if (currentPrincipal !== BOOTSTRAP_ADMIN_PRINCIPAL) return;

    // Mark as attempted to prevent multiple calls
    bootstrapAttempted.current = true;

    // Attempt bootstrap
    (async () => {
      try {
        await actor.assignAdminRoleToCaller();
        
        // On success, invalidate admin-related queries to refresh UI
        await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        
        console.log('Admin bootstrap successful');
      } catch (error: any) {
        // Suppress errors to avoid breaking non-admin logins
        // Expected errors:
        // - "Bootstrap admin has already been assigned" (already bootstrapped)
        // - "Unauthorized: Only the designated bootstrap principal can use this function" (wrong principal)
        // - "Caller is already an admin" (already has admin role)
        
        // Only log for debugging, don't show to user
        if (error?.message?.includes('Bootstrap admin has already been assigned')) {
          console.log('Admin already bootstrapped');
        } else if (error?.message?.includes('Caller is already an admin')) {
          console.log('User is already an admin');
          // Still invalidate queries to ensure UI is up to date
          await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        } else {
          console.log('Admin bootstrap not needed or failed silently:', error?.message);
        }
      }
    })();
  }, [identity, actor, queryClient]);
}
