import mqtt from "mqtt";
import { env } from "./env.js";

const config = {
  username: env.MQTT_USERNAME,
  password: env.MQTT_PASSWORD,
  reconnectPeriod: 5000,
  clean: true,
};

const handlers = new Map();

const client = mqtt.connect(env.MQTT_BROKER_URL, config);

client.on("connect", () => {
  console.log(`Connected to MQTT broker at ${config.port}`);

  let topics = Object.values(env.MQTT_TOPICS);

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err.message);
      } else {
        console.log(`Subscribed to ${topic}`);
      }
    });
  });
});

function topicPatternToRegex(pattern) {
  const escaped = pattern
    .split("/")
    .map((seg) => (seg === "+" ? "([^/]+)" : seg === "#" ? "(.+)" : seg))
    .join("/");
  return new RegExp(`^${escaped}$`);
}

const compiledPattern = new Map();

function getCompiledPattern(pattern) {
  if (!compiledPattern.has(pattern)) {
    compiledPattern.set(pattern, topicPatternToRegex(pattern));
  }
  return compiledPattern.get(pattern);
}

client.on("message", (topic, message) => {
  const exactHandler = handlers.get(topic);
  if (exactHandler) {
    exactHandler(message, topic);
    return;
  }

  for (const [pattern, handler] of handlers.entries()) {
    if (!pattern.includes("+") && !pattern.includes("#")) {
      continue;
    }

    const regex = getCompiledPattern(pattern);

    if (regex.test(topic)) {
      handler(message, topic);
      return;
    }
  }
});

client.on("error", (err) => {
  console.error(`MQTT error:`, err.message);
});

client.on("reconnect", () => {
  console.log("Reconnecting to MQTT broker...");
});

client.on("disconnect", () => {
  console.log("Disconnecting...");
});

export async function onTopic(topic, callback) {
  handlers.set(topic, callback);
}

export default client;
