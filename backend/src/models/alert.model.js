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
