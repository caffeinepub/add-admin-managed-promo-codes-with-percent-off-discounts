import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useProfile';

/**
 * Hook that determines if an authenticated user must complete profile setup.
 * Returns:
 * - isCheckingProfile: true while still loading profile state
 * - mustSetupProfile: true if authenticated user has no profile (after fetch completes)
 */
export function useProfileGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Still checking if we're initializing auth or loading profile
  const isCheckingProfile = isInitializing || (isAuthenticated && profileLoading);

  // User must setup profile if:
  // 1. They are authenticated AND
  // 2. Profile query has completed (isFetched) AND
  // 3. Profile is null
  const mustSetupProfile = isAuthenticated && isFetched && userProfile === null;

  return {
    isCheckingProfile,
    mustSetupProfile,
    isAuthenticated,
  };
}
