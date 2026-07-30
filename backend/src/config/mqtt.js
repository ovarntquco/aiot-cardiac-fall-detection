import mqtt from "mqtt"
import { env } from "./env.js"
import supabase from "./supabase.js";

const handlers = new Map();

const config = {
    port: env.MQTT_PORT,
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    clean: true
};

const client = mqtt.connect(env.MQTT_HOST, config);

client.on("connect", () => {
    console.log(`Connected to MQTT broker at ${MQTT_PORT}`);

    Object.values(env.MQTT_TOPICS).forEach((topic) => {
        client.subscribe(topic, (err) => {
            if (err) {
                console.log(`Failed to connect to ${topic}:`. err.message);
            } else {
                console.log(`Subscribed to ${topic}`);
            }
        });
    });
});

client.on("reconnect", () => {
    console.log("Reconnecting...")
});

client.on("close", () => {
    console.log("Closing...")
});

client.on("error", (err) => {
    console.log(`Error:`, err.message);
});

client.on("message", (topic, payload) => {
    const handler = handlers.get(topic);

    if (handler) {
        handler(payload, topic);
    } else {
        console.log(`No handler registered for topic ${topic}`)
    };
});

export async function onTopic(topic, callback) {
    hadners.set(topic, callback);
}

export default client;