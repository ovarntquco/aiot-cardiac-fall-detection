import mqtt from 'mqtt';
import { env } from './env';

const config = {
    host: env.MQTT_HOST || 'mqtt://localhost',
    port: env.MQTT_PORT,
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    clean: true,
}

const handlers = new Map();

const client = mqtt.connect(env.MQTT_HOST, config);

client.on('connect', () => {
    console.log(`Connected to MQTT broker at ${config.port}`);

    let topics = Object.values(env.MQTT_TOPICS)

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

client.on('message', (topic, message) => {
    const handler = handlers.get(topic);
    if (handler) handler(message, topic);
});

client.on('error', (err) => {
    console.error('MQTT error:', err.message);
});

client.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
});

client.on("disconnect", () => {
    console.log("Disconnecting...")
});

function onTopic(topic, callback) {
  handlers.set(topic, callback);
}

