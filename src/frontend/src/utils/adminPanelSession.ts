/**
 * Admin panel session storage utility
 * Stores a boolean marker (not passwords) keyed to the current principal
 */

const STORAGE_KEY_PREFIX = 'admin_panel_session_';

export function setAdminPanelSession(principalId: string): void {
  if (!principalId) return;
  const key = `${STORAGE_KEY_PREFIX}${principalId}`;
  localStorage.setItem(key, 'true');
}

export function getAdminPanelSession(principalId: string): boolean {
  if (!principalId) return false;
  const key = `${STORAGE_KEY_PREFIX}${principalId}`;
  return localStorage.getItem(key) === 'true';
}

export function clearAdminPanelSession(principalId: string): void {
  if (!principalId) return;
  const key = `${STORAGE_KEY_PREFIX}${principalId}`;
  localStorage.removeItem(key);
}

export function clearAllAdminPanelSessions(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
