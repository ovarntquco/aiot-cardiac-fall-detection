import { env } from "./env.js";

export async function registerWebhook() {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${env.NGROK_URL}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) {
    throw new Error("Can't register webhook");
  }

  console.log("Registered", data.result);
}