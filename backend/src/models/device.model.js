import supabase from "../config/supabase.js";

export async function create(patientAccountId) {
  const { data, error } = await supabase
    .from("devices")
    .insert({ patient_account_id: patientAccountId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findById(deviceId) {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", deviceId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
