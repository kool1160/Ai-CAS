const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseAuthConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

function getAuthHeaders() {
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase environment variables are not configured.');
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };
}

export async function supabaseAuthRequest(path: string, options?: RequestInit) {
  if (!supabaseUrl) throw new Error('Supabase URL is missing.');
  const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  return response;
}
