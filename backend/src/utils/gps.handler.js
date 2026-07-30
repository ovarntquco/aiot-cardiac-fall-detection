import { onTopic } from "../config/mqtt";
import { findById } from "../models/device.model";
import { create } from "../models/gps.model.js";

function isValidLatitude(lat) {
  return typeof lat === 'number' && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
  return typeof lng === 'number' && !Number.isNaN(lng) && lng >= -180 && lng <= 180;
}

onTopic("sensor/gps", async (payload) => {
    try {
        const data = JSON.parse(payload);
    
        const { device_id, latitude, longitude, recorded_at } = data;

        if (!data || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            throw new Error("Invalid payload");
        }

        const exists = await findById(device_id);

        if (!exists) {
            throw new Error("Device not found");
        }

        const results = await create(device_id, latitude, longitude, recorded_at);
    } catch (err) {
        console.log("Handler error:", err.message);
    }
});