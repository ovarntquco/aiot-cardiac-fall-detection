import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create(patientAccountId) {
  return runQuery(
    supabase
      .from("devices")
      .insert({ patient_account_id: patientAccountId })
      .select("*")
      .single()
  );
}

export async function findById(id) {
  return runQuery(
    supabase
      .from("devices")
      .select("*")
      .eq("id", id)
      .maybeSingle()
  );
}

export async function findByPatientAccountId(patientAccountId) {
  return runQuery(
    supabase
      .from("devices")
      .select("*")
      .eq("patient_account_id", patientAccountId)
      .maybeSingle()
  );
}

export async function findChatIdById(id) {
  return runQuery(
    supabase
      .from("devices")
      .select("patient:accounts(chat_id)")
      .eq("id", id)
      .maybeSingle()
  );
}

export async function findGpsByEvent({ id, recordedAt }) {
  return runQuery(
    supabase
      .from("devices")
      .select(`
        gps_readings!inner (
          latitude,
          longitude,
          recorded_at
        ),
        events!inner ( id )
      `)
      .eq("events.id", id)
      .gte("gps_readings.recorded_at", recordedAt)
      .lte("gps_readings.recorded_at", new Date(Date(recordedAt) + 30 * 1000).toISOString())
      .order("recorded_at", { ascending: false, foreignTable: "gps_readings" })
      .limit(1)
      .maybeSingle()
  );
}
