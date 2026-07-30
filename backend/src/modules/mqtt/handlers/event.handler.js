import * as Event from "../../../models/event.model.js";

export default async function handleEvent(ctx) {
  const { data, device } = ctx;

  try {
    await Event.create({
      deviceId: device.id,
      type: data.type,
      recordedAt: data.recordedAt,
    });
  } catch (err) {
    console.warn(`[event] Failed to save event:`, err.message);
  }
}
