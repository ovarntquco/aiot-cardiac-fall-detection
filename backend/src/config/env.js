import "dotenv/config";

const requireEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MQTT_BROKER_URL",
  "MQTT_USERNAME",
  "MQTT_PASSWORD",
  "CARDIAC_TOPIC",
  "MOTION_TOPIC",
  "GPS_TOPIC",
  "EVENT_TOPIC",
];

const missing = requireEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL,
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD,
  MQTT_TOPICS: {
    CARDIAC: process.env.CARDIAC_TOPIC,
    MOTION: process.env.MOTION_TOPIC,
    GPS: process.env.GPS_TOPIC,
    EVENT: process.env.EVENT_TOPIC,
  },
};
