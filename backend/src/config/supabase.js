import { env } from "./env.js";
import { createClient } from "@supabase/supabase-js";
import * as CardiacReading from "../models/cardiacReading.model.js";
import * as GpsReading from "../models/gpsReading.model.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  db: { schema: "cfd_system" },
});

const readingSources = {
  cardiac: createReadingSource("cardiac_readings", CardiacReading.findLatestByDeviceId),
  gps: createReadingSource("gps_readings", GpsReading.findLatestByDeviceId),
};
let readingsChannel = null;

export function startRealtimeDatabase() {
  if (readingsChannel) return readingsChannel;

  let channel = supabase.channel("backend-device-readings");

  for (const source of Object.values(readingSources)) {
    channel = channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "cfd_system", table: source.table },
      ({ new: reading }) => storeLatest(source.cache, reading),
    );
  }

  readingsChannel = channel.subscribe((status, error) => {
    if (error) {
      console.error("[realtime] Subscription error:", error.message);
    } else if (status === "SUBSCRIBED") {
      console.log("[realtime] Listening for cardiac and GPS readings");
    }
  });

  return readingsChannel;
}

export async function stopRealtimeDatabase() {
  if (!readingsChannel) return;
  await supabase.removeChannel(readingsChannel);
  readingsChannel = null;
}

export async function getLatestCardiacReading(deviceId) {
  return getLatestReading(readingSources.cardiac, deviceId);
}

export async function getLatestGpsReading(deviceId) {
  return getLatestReading(readingSources.gps, deviceId);
}

function createReadingSource(table, loadLatest) {
  return { table, loadLatest, cache: new Map() };
}

async function getLatestReading(source, deviceId) {
  if (source.cache.has(deviceId)) return source.cache.get(deviceId);

  const reading = await source.loadLatest(deviceId);
  initializeCache(source.cache, deviceId, reading);
  return source.cache.get(deviceId);
}

function initializeCache(cache, deviceId, reading) {
  if (reading) storeLatest(cache, reading);
  else if (!cache.has(deviceId)) cache.set(deviceId, null);
}

function storeLatest(cache, reading) {
  if (!reading?.device_id) return;

  const current = cache.get(reading.device_id);
  if (!current || toTimestamp(reading.recorded_at) >= toTimestamp(current.recorded_at)) {
    cache.set(reading.device_id, reading);
  }
}

function toTimestamp(value) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default supabase;
