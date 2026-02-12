import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useAdminPanelSession } from './useAdminPanelSession';

interface AdminLoginParams {
  username: string;
  password: string;
}

export function useAdminLogin() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { setLoggedIn } = useAdminPanelSession();

  return useMutation({
    mutationFn: async ({ username, password }: AdminLoginParams) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to access admin features');

      const success = await actor.adminLogin(username, password);
      
      if (!success) {
        throw new Error('Invalid credentials');
      }

      return success;
    },
    onSuccess: () => {
      // Set the persisted admin panel session marker
      setLoggedIn();
      
      // Navigate to admin panel
      window.location.hash = '/admin';
    },
  });
}
