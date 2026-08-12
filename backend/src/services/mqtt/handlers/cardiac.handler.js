import * as CardiacReading from "../../../models/cardiacReading.model.js";

export default async function handleCardiac(ctx) {
  const { data, device } = ctx;

  try {
    await CardiacReading.create({
      deviceId: device.id,
      heartRate: data.heartRate,
      spo2: data.spo2,
      recordedAt: new Date(data.recordedAt),
    });
  } catch (err) {
    console.error("[cardiac] Failed to save reading:", err.message);
  }
}
