import { onTopic } from "../../config/mqtt.js";
import { env } from "../../config/env.js";
import MqttRouter from "./router.js";
import {
  parseJson,
  logMessage,
  validateDevice,
  validateCardiacPayload,
  validateMotionPayload,
  validateGpsPayload,
  validateEventPayload,
} from "./middlewares.js";
import handleCardiac from "./handlers/cardiac.handler.js";
import handleMotion from "./handlers/motion.handler.js";
import handleGps from "./handlers/gps.handler.js";
import handleEvent from "./handlers/event.handler.js";

const router = new MqttRouter();

router.use(logMessage);
router.use(parseJson);

router.on(
  env.MQTT_SUBSCRIBE_TOPICS.CARDIAC,
  validateDevice,
  validateCardiacPayload,
  handleCardiac,
);
router.on(
  env.MQTT_SUBSCRIBE_TOPICS.MOTION,
  validateDevice,
  validateMotionPayload,
  handleMotion,
);
router.on(env.MQTT_SUBSCRIBE_TOPICS.GPS, validateDevice, validateGpsPayload, handleGps);
router.on(
  env.MQTT_SUBSCRIBE_TOPICS.EVENT,
  validateDevice,
  validateEventPayload,
  handleEvent,
);

export default function initMqttRouter() {
  Object.values(env.MQTT_SUBSCRIBE_TOPICS).forEach((topic) => {
    onTopic(topic, (message, topicName) => {
      router.handle(topicName, message).catch((err) => {
        console.error(`[MQTT] Handler error for ${topicName}:`, err);
      });
    });
  });
}
