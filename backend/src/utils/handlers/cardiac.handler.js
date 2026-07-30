import onTopic from '../../config/mqtt.js'
import { create } from '../../models/cardiac.model.js';

function verify(num) {
    return num >= 0 && !isNaN(num) && isFinite(num);
}

onTopic("sensor/vitals", (payload) => {
    try {
        const data = JSON.parse(payload);

        const { deviceId, heartRate, spo2, recordedAt } = data;

        if (!data || !verify(heartRate) || !verify(spo2)) {
            throw new Error("Invalid cardidac data");
        }

        const results = create(deviceId, heartRate, spo2, recordedAt);
    } catch (err) {
        console.log(err.message);
    }
})