import supabase from "../config/supabase";

export async function create({ deviceId, heartRate, spo2, recordedAt }) {
  const { data, error } = await supabase
    .from("cardiac_readings")
    .insert({
      device_id: deviceId,
      heart_rate: heartRate,
      spo2,
      recorded_at: recordedAt,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
