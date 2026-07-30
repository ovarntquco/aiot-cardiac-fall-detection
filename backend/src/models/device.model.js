import supabase from "../config/supabase.js";

export async function create(patientAccountId) {
  const { data, error } = await supabase
    .from('devices')
    .insert({ patient_account_id: patientAccountId })
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findById(id) {
    const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("device_id", id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}