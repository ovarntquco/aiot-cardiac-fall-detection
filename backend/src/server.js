import { env } from "./config/env.js";
import app from "./app.js";
import registerWebhook from "./config/telegram.js";
import {
  startRealtimeDatabase,
  stopRealtimeDatabase,
} from "./config/supabase.js";

await registerWebhook();
startRealtimeDatabase();

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown() {
  await stopRealtimeDatabase();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
