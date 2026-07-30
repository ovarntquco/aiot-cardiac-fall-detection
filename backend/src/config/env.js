import 'dotenv/config';

const requireEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MQTT_HOST',
  'MQTT_USERNAME',
  'MQTT_PASSWORD',
  'MQTT_TOPICS',
  'SUPABASE_PRIVATE_CHANNEL'
]

const missing = requireEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
<<<<<<< HEAD
=======
  MQTT_HOST: process.env.MQTT_HOST,
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD,
  MQTT_TOPICS: process.env.MQTT_TOPICS,
  MQTT_PORT: process.env.MQTT_PORT || '8883',
  SUPABASE_PRIVATE_CHANNEL: process.env.SUPABASE_PRIVATE_CHANNEL
>>>>>>> b1707b4413818e797312e58af84f9c8f6db5db64
};