import supabase from "../config/supabase.js";

export async function create({ deviceId, type, recordedAt }) {
  const { data, error } = await supabase
    .from("events")
    .insert({ device_id: deviceId, type, recorded_at: recordedAt })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
