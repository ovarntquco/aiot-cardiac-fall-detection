import onTopic from '../../config/mqtt.js'
import { create } from '../../models/gps.model.js';

function isValidLatitude(lat) {
    return typeof lat === 'number' && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
    return typeof lng === 'number' && !Number.isNaN(lng) && lng >= -180 && lng <= 180;
}

onTopic("sensor/gps", (payload) => {
    try {
        const data = JSON.parse(payload);

        const { deviceId, latitude, longitude, recordedAt } = data;

        if (!data || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            throw new Error("Invalid GPS data");
        }

        const results = create(deviceId, latitude, longitude, recordedAt);
    } catch (err) {
        console.log(err.message);
    }
})