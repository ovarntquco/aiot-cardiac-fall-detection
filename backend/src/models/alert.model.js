import supabase from "../config/supabase.js";
import { env } from "../config/env.js";

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

let config = {
  method: 'POST',
  header: { 'Content-Type': 'application/json' },
  body: undefined
};

export async function sendTelegram(chat_id) {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;

  config.body = JSON.stringify({
    chat_id: chat_id,
    text: "[SOS] - Alerts gone off"
  });

  const response = await fetch(url, config)

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Can't send message to user`);
  }

  return data.result;
}