import * as GpsReading from "../../../models/gpsReading.model.js";

export default async function handleGps(ctx) {
  const { data, device } = ctx;

  try {
    await GpsReading.create({
      deviceId: device.id,
      latitude: data.latitude,
      longitude: data.longitude,
      recordedAt: data.recordedAt,
    });
  } catch (err) {
    console.error("[gps] Failed to save reading:", err.message);
  }
}
