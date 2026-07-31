import * as Event from "../../../models/event.model.js";
import { sendTelegram } from "../../../models/alert.model.js";
import { findChatIdByDeviceId } from "./user.model.js";

export default async function handleEvent(ctx) {
  const { data, device } = ctx;

  try {
    await Event.create({
      deviceId: device.id,
      type: data.type,
      recordedAt: data.recordedAt,
    });

    const chatId = await findChatIdByDeviceId(device.id);

    await sendTelegram(chatId);
  } catch (err) {
    console.warn(`[event] Failed to save event:`, err.message);
  }
}
