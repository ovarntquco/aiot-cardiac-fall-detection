import { env } from "../../config/env.js";

const URL = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;

function formatAlertMessage({ event, gps }) {
  const timestamp = new Date(event.recorded_at);
  const formattedTime = isNaN(timestamp.getTime())
    ? "unknown time"
    : timestamp.toLocaleString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
  const locationText = gps && gps.latitude && gps.longitude
    ? ` Location: https://maps.google.com/?q=${gps.latitude},${gps.longitude}`
    : "";

  return `⚠️ ALERT: event detected at ${formattedTime}.${locationText}`;
}

export default async function sendTelegram({ chatId, event, gps, retryMax = 3 }) {
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatAlertMessage({ event, gps }),
    }),
  };
  
  let retry = 0;
  let lastError;

  while (retry < retryMax) {
    try {
      const res = await fetch(URL, config)
      
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      lastError = err;
      retry++;
      console.warn(`Attempt ${retry} failed: ${err.message}`);

      if (retry < retryMax) {
        await new Promise((resolve) => setTimeout(resolve, 500 * retry));
      }
    }
  }

  throw new Error(`Failed after ${retryMax} attempts: ${lastError.message}`);
}
