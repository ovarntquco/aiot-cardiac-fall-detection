import supabase from "../config/supabase.js";

export async function create({ deviceId, latitude, longitude, recordedAt }) {
  const { data, error } = await supabase
    .from("gps_readings")
    .insert({
      device_id: deviceId,
      latitude,
      longitude,
      recorded_at: recordedAt,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
