import type { AuthenticatedUser, CurrentUser } from '../types/wocSessionTypes';
import { clearCurrentUserFromStorage, saveCurrentUserToStorage } from './currentUserStorage';

export const AUTH_USERS_STORAGE_KEY = 'refab-connect-auth-users';
export const AUTH_SESSION_STORAGE_KEY = 'refab-connect-auth-session';
export const AUTH_SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type StoredAuthUser = AuthenticatedUser & {
  displayName: string;
  password: string;
  createdAt: string;
};

type StoredAuthSession = {
  token: string;
  userId: string;
  expiresAt: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createAuthToken() {
  const randomValue = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `local-session-${Date.now()}-${randomValue}`;
}

function sanitizeStoredUser(value: unknown): StoredAuthUser | null {
  if (!isObject(value)) return null;

  const id = stringValue(value.id);
  const email = normalizeEmail(stringValue(value.email));
  const displayName = stringValue(value.displayName).trim();
  const password = stringValue(value.password);
  const createdAt = stringValue(value.createdAt);

  if (!id || !email || !displayName || !password || !createdAt) return null;

  return { id, email, displayName, password, createdAt };
}

function loadStoredUsers() {
  try {
    const raw = window.localStorage.getItem(AUTH_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeStoredUser).filter((user): user is StoredAuthUser => Boolean(user));
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredAuthUser[]) {
  window.localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
}

function sanitizeSession(value: unknown): StoredAuthSession | null {
  if (!isObject(value)) return null;

  const token = stringValue(value.token);
  const userId = stringValue(value.userId);
  const expiresAt = stringValue(value.expiresAt);

  if (!token || !userId || !expiresAt) return null;
  return { token, userId, expiresAt };
}

function saveCompatibilityUser(user: StoredAuthUser) {
  const compatibilityUser: CurrentUser = {
    userId: user.id,
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    emailOrEmployeeId: user.email,
    loginTimestamp: new Date().toLocaleString(),
  };

  saveCurrentUserToStorage(compatibilityUser);
}

function createSession(user: StoredAuthUser) {
  const session: StoredAuthSession = {
    token: createAuthToken(),
    userId: user.id,
    expiresAt: new Date(Date.now() + AUTH_SESSION_DURATION_MS).toISOString(),
  };

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  saveCompatibilityUser(user);

  return {
    user: { id: user.id, email: user.email, displayName: user.displayName },
    expiresAt: session.expiresAt,
  };
}

export function restoreAuthSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = sanitizeSession(JSON.parse(raw));
    if (!session || Date.parse(session.expiresAt) <= Date.now()) {
      clearAuthSession();
      return null;
    }

    const user = loadStoredUsers().find((candidate) => candidate.id === session.userId);
    if (!user) {
      clearAuthSession();
      return null;
    }

    saveCompatibilityUser(user);
    return {
      user: { id: user.id, email: user.email, displayName: user.displayName },
      expiresAt: session.expiresAt,
    };
  } catch {
    clearAuthSession();
    return null;
  }
}

export function signUpWithLocalAuth(displayName: string, email: string, password: string) {
  const cleanedName = displayName.trim();
  const cleanedEmail = normalizeEmail(email);

  if (!cleanedName || !cleanedEmail || !password) throw new Error('Enter a name, email, and password.');

  const users = loadStoredUsers();
  if (users.some((user) => user.email === cleanedEmail)) throw new Error('An AI-CAS account already exists for this email. Sign in instead.');

  const user: StoredAuthUser = {
    id: `USER-${Date.now()}`,
    email: cleanedEmail,
    displayName: cleanedName,
    password,
    createdAt: new Date().toISOString(),
  };

  saveStoredUsers([...users, user]);
  return createSession(user);
}

export function signInWithLocalAuth(email: string, password: string) {
  const cleanedEmail = normalizeEmail(email);
  const user = loadStoredUsers().find((candidate) => candidate.email === cleanedEmail);

  if (!user || user.password !== password) throw new Error('Invalid email or password.');
  return createSession(user);
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  clearCurrentUserFromStorage();
}
