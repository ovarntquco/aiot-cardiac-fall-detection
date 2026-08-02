import { env } from "./config/env.js";
import app from "./app.js";
import registerWebhook from "./config/telegram.js";

await registerWebhook();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});
