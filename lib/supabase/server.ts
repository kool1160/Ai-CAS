import { supabaseAuthRequest } from './client';

export async function getSupabaseUserByAccessToken(accessToken: string) {
  const response = await supabaseAuthRequest('/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
}
