import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create({ deviceId, latitude, longitude, recordedAt }) {
  return runQuery(
    supabase
      .from("gps_readings")
      .insert({
        device_id: deviceId,
        latitude, longitude,
        recorded_at: recordedAt,
      })
      .select("*")
      .single()
  );
}

export async function findLatestByDeviceId(deviceId) {
  return runQuery(
    supabase
      .from("gps_readings")
      .select("device_id, latitude, longitude, recorded_at")
      .eq("device_id", deviceId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
}
