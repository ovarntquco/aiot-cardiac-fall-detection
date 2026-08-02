import { env } from "./env.js";

const URL = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${env.NGROK_URL}`;

export default async function registerWebhook() {
  const res = await fetch(URL);
  const data = await res.json();

  if (!data.ok) {
    throw new Error("Can't register webhook");
  }

  console.log("Registered", data.result);
}