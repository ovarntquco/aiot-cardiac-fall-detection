import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create({ deviceId, heartRate, spo2, recordedAt }) {
  return runQuery(
    supabase
      .from("cardiac_readings")
      .insert({
        device_id: deviceId,
        heart_rate: heartRate,
        spo2,
        recorded_at: recordedAt,
      })
      .select("*")
      .single()
  );
}
