import * as Device from "../../models/device.model.js";

export async function parseJson(ctx, next) {
  try {
    ctx.data = JSON.parse(ctx.message.toString());
  } catch (err) {
    console.error(`[MQTT] Invalid JSON on ${ctx.topic}:`, err.message);
    return;
  }
  await next();
}

export async function logMessage(ctx, next) {
  console.log(`[MQTT] ${new Date().toISOString()} <- ${ctx.topic}`);
  await next();
}

export async function validateDevice(ctx, next) {
  const deviceId = ctx.data?.deviceId;

  if (!deviceId) {
    console.warn(`[MQTT] Missing deviceId in payload on topic ${ctx.topic}`);
    return;
  }

  const device = await Device.findById(deviceId);

  if (!device) {
    console.warn(`[MQTT] Unknow or invalid device: ${deviceId}`);
    return;
  }

  ctx.device = device;
  await next();
}

export async function validateCardiacPayload(ctx, next) {
  const { heartRate, spo2 } = ctx.data;

  if (heartRate == null || spo2 == null) {
    console.warn(
      `[MQTT] Missing heartRate/spo2 in payload on topic ${ctx.topic}`,
    );
    return;
  }

  if (heartRate < 20 || heartRate > 250) {
    console.warn(`[MQTT] heartRate out of valid range: ${heartRate}`);
    return;
  }

  if (spo2 < 0 || spo2 > 100) {
    console.warn(`[MQTT] spo2 out of valid range: ${spo2}`);
    return;
  }

  await next();
}

export async function validateMotionPayload(ctx, next) {
  const arrays = [
    ctx.data.acceX,
    ctx.data.acceY,
    ctx.data.acceZ,
    ctx.data.gyroX,
    ctx.data.gyroY,
    ctx.data.gyroZ,
  ];

  const valid =
    arrays.every(Array.isArray) &&
    arrays.every((a) => a.length > 0) &&
    arrays.every((a) => a.length === arrays[0].length);

  if (!valid) {
    console.warn(`[MQTT] Mismatched or empty array lengths in payload on topic ${ctx.topic}, skipping batch`);
    return;
  }

  await next();
}

export async function validateGpsPayload(ctx, next) {
  const { latitude, longitude } = ctx.data;

  if (latitude == null || longitude == null) {
    console.warn(
      `[MQTT] Missing latitude/longitude in payload on topic ${ctx.topic}`,
    );
    return;
  }

  if (latitude < -90 || latitude > 90) {
    console.warn(`[MQTT] latitude out of valid range: ${latitude}`);
    return;
  }

  if (longitude < -180 || longitude > 180) {
    console.warn(`[MQTT] longitude out of valid range: ${longitude}`);
    return;
  }

  await next();
}

export async function validateEventPayload(ctx, next) {
  const { type } = ctx.data;

  if (!type) {
    console.warn(`[MQTT] Missing type in payload in topic ${ctx.topic}`);
    return;
  }

  if (!["system", "user"].includes(type)) {
    console.warn(`[MQTT] Invalid type: ${type}`);
    return;
  }

  await next();
}
