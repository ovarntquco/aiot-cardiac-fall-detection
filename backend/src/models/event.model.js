import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create({ deviceId, type, recordedAt }) {
  return runQuery(
    supabase
      .from("events")
      .insert({ device_id: deviceId, type, recorded_at: recordedAt })
      .select("*")
      .single()
  );
}
