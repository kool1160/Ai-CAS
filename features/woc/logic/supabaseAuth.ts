import type { CurrentUser } from '../types/wocSessionTypes';

export const AUTH_SESSION_STORAGE_KEY = 'refab-connect-supabase-auth-session';
export const CURRENT_USER_STORAGE_KEY = 'refab-connect-current-user';
export const LEGACY_EMAIL_STORAGE_KEY = 'aicas-supabase-email';
export const AUTH_SIGN_OUT_EVENT = 'aicas:sign-out';

type SupabaseAuthUser = {
  id?: unknown;
  email?: unknown;
};

type SupabaseAuthPayload = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_at?: unknown;
  expires_in?: unknown;
  user?: SupabaseAuthUser;
};

export type StoredSupabaseSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: CurrentUser;
};

function normalizeEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '') ?? '';
}

function normalizeSupabaseUrl(value?: string) {
  return normalizeEnvValue(value)
    .replace(/^NEXT_PUBLIC_SUPABASE_URL=/, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/g, '');
}

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = normalizeEnvValue(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function isSupabaseAuthConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

function assertSupabaseConfig() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error(
      'Supabase is not configured for this deployment. Check the Vercel Preview environment variables.',
    );
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function authHeaders(accessToken?: string) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${accessToken || supabaseKey}`,
    'Content-Type': 'application/json',
  };
}

function toCurrentUser(user: SupabaseAuthUser | undefined): CurrentUser | null {
  const userId = stringValue(user?.id);
  const email = stringValue(user?.email).trim().toLowerCase();
  if (!userId || !email) return null;

  return {
    userId,
    displayName: email,
    emailOrEmployeeId: email,
    appUnlockPin: '0000',
    loginTimestamp: new Date().toLocaleString(),
  };
}

function restoreCurrentUser(value: unknown): CurrentUser | null {
  if (!isObject(value)) return null;

  const userId = stringValue(value.userId);
  const email = stringValue(value.emailOrEmployeeId).trim().toLowerCase();
  const displayName = stringValue(value.displayName).trim() || email;
  const loginTimestamp = stringValue(value.loginTimestamp) || new Date().toLocaleString();

  if (!userId || !email) return null;
  return {
    userId,
    displayName,
    emailOrEmployeeId: email,
    appUnlockPin: '0000',
    loginTimestamp,
  };
}

function toStoredSession(payload: SupabaseAuthPayload): StoredSupabaseSession | null {
  const accessToken = stringValue(payload.access_token);
  const refreshToken = stringValue(payload.refresh_token);
  const user = toCurrentUser(payload.user);
  if (!accessToken || !refreshToken || !user) return null;

  const explicitExpiresAt = numberValue(payload.expires_at);
  const expiresIn = numberValue(payload.expires_in);
  const expiresAt = explicitExpiresAt || Math.floor(Date.now() / 1000) + expiresIn;
  if (!expiresAt) return null;

  return { accessToken, refreshToken, expiresAt, user };
}

async function parseAuthResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.msg === 'string' || typeof payload?.error_description === 'string' || typeof payload?.error === 'string'
      ? payload.msg || payload.error_description || payload.error
      : 'Supabase authentication failed.';
    throw new Error(message);
  }

  const session = toStoredSession(payload);
  if (!session) throw new Error('Supabase did not return a complete authenticated session.');
  saveSupabaseSession(session);
  return session;
}

export async function signInWithSupabase(email: string, password: string) {
  assertSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return parseAuthResponse(response);
}

export async function signUpWithSupabase(email: string, password: string) {
  assertSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return parseAuthResponse(response);
}

export async function refreshSupabaseSession(refreshToken: string) {
  assertSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return parseAuthResponse(response);
}

export async function validateSupabaseSession(session: StoredSupabaseSession) {
  assertSupabaseConfig();
  const activeSession = session.expiresAt <= Math.floor(Date.now() / 1000) + 30
    ? await refreshSupabaseSession(session.refreshToken)
    : session;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: authHeaders(activeSession.accessToken),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Supabase session is no longer valid.');

  const user = toCurrentUser(payload);
  if (!user) throw new Error('Supabase session did not include a valid user.');

  const validatedSession = { ...activeSession, user };
  saveSupabaseSession(validatedSession);
  return validatedSession;
}

export function loadSupabaseSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;

    const user = restoreCurrentUser(parsed.user);
    const session: StoredSupabaseSession = {
      accessToken: stringValue(parsed.accessToken),
      refreshToken: stringValue(parsed.refreshToken),
      expiresAt: numberValue(parsed.expiresAt),
      user: user as CurrentUser,
    };

    if (!session.accessToken || !session.refreshToken || !session.expiresAt || !user) {
      clearSupabaseSession();
      return null;
    }

    return session;
  } catch {
    clearSupabaseSession();
    return null;
  }
}

export function saveSupabaseSession(session: StoredSupabaseSession) {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(session.user));
  window.localStorage.removeItem(LEGACY_EMAIL_STORAGE_KEY);
}

export async function signOutWithSupabase(accessToken: string) {
  clearSupabaseSession();

  if (!supabaseUrl || !supabaseKey || !accessToken) return;

  try {
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: authHeaders(accessToken),
    });
  } catch {
    // Local sign-out is authoritative. Remote revocation is best effort.
  }
}

export function clearSupabaseSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_EMAIL_STORAGE_KEY);
}
