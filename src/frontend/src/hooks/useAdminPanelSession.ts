import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import {
  getAdminPanelSession,
  setAdminPanelSession,
  clearAdminPanelSession,
} from '../utils/adminPanelSession';

export function useAdminPanelSession() {
  const { identity, isInitializing } = useInternetIdentity();
  const [isAdminPanelLoggedIn, setIsAdminPanelLoggedIn] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';

  // Load session state when identity changes
  useEffect(() => {
    if (!isInitializing && principalId) {
      const hasSession = getAdminPanelSession(principalId);
      setIsAdminPanelLoggedIn(hasSession);
    } else {
      setIsAdminPanelLoggedIn(false);
    }
  }, [principalId, isInitializing]);

  const setLoggedIn = () => {
    if (principalId) {
      setAdminPanelSession(principalId);
      setIsAdminPanelLoggedIn(true);
    }
  };

  const clearLoggedIn = () => {
    if (principalId) {
      clearAdminPanelSession(principalId);
    }
    setIsAdminPanelLoggedIn(false);
  };

  return {
    isAdminPanelLoggedIn,
    setLoggedIn,
    clearLoggedIn,
    isLoading: isInitializing,
  };
}
