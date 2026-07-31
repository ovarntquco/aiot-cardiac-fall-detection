import * as Event from "../../../models/event.model.js";
import * as Device from "../../../models/device.model.js";
import { sendTelegram } from "../../../models/alert.model.js";

export default async function handleEvent(ctx) {
  const { data, device } = ctx;

  try {
    await Event.create({
      deviceId: device.id,
      type: data.type,
      recordedAt: data.recordedAt,
    });

    const patient = await Device.findChatIdById(device.id);

    await sendTelegram(patient.chat_id);
  } catch (err) {
    console.warn(`[event] Failed to save event:`, err.message);
  }
}
