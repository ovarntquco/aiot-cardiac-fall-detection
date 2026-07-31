import supabase from "../config/supabase";

export async function create({ eventId, type }) {
  const { data, error } = await supabase
    .from("alerts")
    .insert({ event_id: eventId, type })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findById(device_id) {
  const { data, error } = await supabase
    .from("alerts")
    .select(`
      id,
      event_id,
      type
      created_at,
      events!inner (id, device_id)
    `)
    .eq("events.device_id", device_id)
    .maybeSingle()

    if (error) {
      throw new Error(error.message);
    }

    return data;
}