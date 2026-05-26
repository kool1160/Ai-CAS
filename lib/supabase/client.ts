const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function normalizeEnvValue(value?: string) {
  return value
    ?.trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^NEXT_PUBLIC_SUPABASE_URL=/, '')
    .trim();
}

function getSupabaseBaseUrl() {
  const normalized = normalizeEnvValue(rawSupabaseUrl);
  if (!normalized) return '';

  return normalized
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/g, '');
}

export function isSupabaseAuthConfigured() {
  return Boolean(getSupabaseBaseUrl() && supabaseKey);
}

function getAuthHeaders() {
  if (!getSupabaseBaseUrl() || !supabaseKey) throw new Error('Supabase environment variables are not configured.');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };
}

export async function supabaseAuthRequest(path: string, options?: RequestInit) {
  const supabaseBaseUrl = getSupabaseBaseUrl();
  if (!supabaseBaseUrl) throw new Error('Supabase URL is missing.');

  const authPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${supabaseBaseUrl}/auth/v1${authPath}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  return response;
}
