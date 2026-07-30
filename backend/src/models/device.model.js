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
<<<<<<< HEAD
=======
}

export async function findById(deviceId) {
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("id", deviceId)
      .select()
      .maybeSingle()

    if (error) {
      throw new Error(error.message);
    }

    return data;
>>>>>>> b1707b4413818e797312e58af84f9c8f6db5db64
}