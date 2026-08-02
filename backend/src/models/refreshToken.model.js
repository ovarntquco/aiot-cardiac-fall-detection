import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create({ userId, token, expiresAt }) {
  return runQuery(
    supabase
    .from("refresh_tokens")
    .insert({ token, user_id: userId, expires_at: expiresAt })
  );
}

export async function findByToken(token) {
  return runQuery(
    supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle()
  );
}

export async function remove(token) {
  return runQuery(
    supabase
      .from("refresh_tokens")
      .delete()
      .eq("token", token)
  );
}

export async function removeAllTokensForUser(userId) {
  return runQuery(
    supabase
      .from("refresh_tokens")
      .delete()
      .eq("user_id", userId)
    );
}
