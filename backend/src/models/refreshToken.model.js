import supabase from '../config/supabase.js';

export async function create({ userId, token, expiresAt }) {
  const { error } = await supabase
    .from('refresh_tokens')
    .insert({ token, user_id: userId, expires_at: expiresAt});

  if (error) {
    throw new Error(error.message);
  }
}

export async function findByToken(token) {
  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function remove(token) {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('token', token);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeAllTokensForUser(userId) {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(error.message);
  }
}