import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";
import { env } from "../config/env.js";

export async function create(eventId) {
  return runQuery(
    supabase
      .from("alerts")
      .insert({ event_id: eventId })
      .select("*")
      .single()
  );
}

export async function findById(id) {
  return runQuery(
    supabase
      .from("alerts")
      .select("*")
      .eq("id", id)
      .maybeSingle()
  );
}

export async function findAlertsByAccountId(accountId) {
  return runQuery(
    supabase
      .from("alerts")
      .select(`
        id,
        event_id,
        events!inner ( 
          device_id, 
          recorded_at,
          devices!inner ( patient_account_id )
        )
      `)
      .eq("events.devices.patient_account_id", accountId)
  );
}
