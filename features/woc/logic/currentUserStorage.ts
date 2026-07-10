import type { CurrentUser } from '../types/wocSessionTypes';

export const CURRENT_USER_STORAGE_KEY = 'refab-connect-current-user';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function normalizePin(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function getSubmittedByLabel(user: CurrentUser | null) {
  if (!user) return 'Unknown local user';
  return `${user.displayName} (${user.email})`;
}

export function sanitizeCurrentUser(value: unknown): CurrentUser | null {
  if (!isObject(value)) return null;

  const userId = stringValue(value.userId || value.id);
  const displayName = stringValue(value.displayName);
  const email = stringValue(value.email || value.emailOrEmployeeId);
  const loginTimestamp = stringValue(value.loginTimestamp);

  if (!userId || !displayName || !email || !loginTimestamp) return null;

  return {
    userId,
    id: userId,
    displayName,
    email,
    emailOrEmployeeId: email,
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
