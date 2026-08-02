import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create({ email, passwordHash, role }) {
  return runQuery(
    supabase
      .from("users")
      .insert({ email, password_hash: passwordHash, role })
      .select("*")
      .single()
  );
}

export async function findByEmail(email) {
  return runQuery(
    supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()
  );
}

export async function findById(id) {
  return runQuery(
    supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle()
  );
}
