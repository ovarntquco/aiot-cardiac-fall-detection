import supabase from "../config/supabase.js";

export async function create({ email, passwordHash, role }) {
  const { data, error } = await supabase
    .from("users")
    .insert({ email, password_hash: passwordHash, role })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findChatIdByDeviceId(deviceId) {
  const { data, error } = await supabase
    .from("devices")
    .select(
      `id,
      patient_account_id,
      users ( chat_id )
    `)
    .eq("id", deviceId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.users.chat_id;
}