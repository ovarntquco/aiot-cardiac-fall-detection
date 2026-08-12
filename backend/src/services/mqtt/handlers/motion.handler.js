import * as MotionReading from "../../../models/motionReading.model.js";

export default async function handleMotion(ctx) {
  const { data, device } = ctx;

  try {
    await MotionReading.create({
      deviceId: device.id,
      windowStart: new Date(data.windowStart),
      sampleRateHz: data.sampleRateHz,
      tOffsets: data.tOffsets,
      acceX: data.acceX,
      acceY: data.acceY,
      acceZ: data.acceZ,
      gyroX: data.gyroX,
      gyroY: data.gyroY,
      gyroZ: data.gyroZ,
    });
  } catch (err) {
    console.error(`[motion] Failed to save reading:`, err.message);
  }
}
