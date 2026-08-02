import * as Alert from "../../../models/alert.model.js"
import * as Device from "../../../models/device.model.js";
import * as Event from "../../../models/event.model.js";
import sendTelegram from "../../telegram/services.js";

export default async function handleEvent(ctx) {
  const { data, device } = ctx;

  try {
    const dev = await Device.findChatIdById(device.id);
    
    const event = await Event.create({
      deviceId: device.id,
      type: data.type,
      recordedAt: data.recordedAt,
    });

    const alert = await Alert.create(event.id);
    const gps = await Device.findGpsByEvent({ id: event.id, recordedAt: event.recorded_at });

    if (!gps) {
      console.warn(`[event] No GPS records found`);
    }

    await sendTelegram({
      chatId: dev.patient.chat_id,
      event: event,
      gps: gps
    });
  } catch (err) {
    console.warn(`[event] Failed to save event:`, err);
  }
}
