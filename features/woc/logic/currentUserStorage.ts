import type { CurrentUser } from '../types/wocSessionTypes';

export const CURRENT_USER_STORAGE_KEY = 'refab-connect-current-user';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function getSubmittedByLabel(user: CurrentUser | null) {
  if (!user) return 'Unknown local user';
  return `${user.displayName} (${user.emailOrEmployeeId})`;
}

export function sanitizeCurrentUser(value: unknown): CurrentUser | null {
  if (!isObject(value)) return null;

  const userId = stringValue(value.userId);
  const displayName = stringValue(value.displayName);
  const emailOrEmployeeId = stringValue(value.emailOrEmployeeId);
  const loginTimestamp = stringValue(value.loginTimestamp);

  if (!userId || !displayName || !emailOrEmployeeId || !loginTimestamp) return null;

  return {
    userId,
    displayName,
    emailOrEmployeeId,
    loginTimestamp,
  };
}

export function loadCurrentUserFromStorage() {
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return null;
    return sanitizeCurrentUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveCurrentUserToStorage(user: CurrentUser) {
  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUserFromStorage() {
  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

export function createCurrentUser(displayName: string, emailOrEmployeeId: string): CurrentUser {
  const cleanedName = displayName.trim();
  const cleanedId = emailOrEmployeeId.trim();

  return {
    userId: `USER-${Date.now()}`,
    displayName: cleanedName,
    emailOrEmployeeId: cleanedId,
    loginTimestamp: new Date().toLocaleString(),
  };
}
