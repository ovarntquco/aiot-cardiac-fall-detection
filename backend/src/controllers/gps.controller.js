import * as GPS from '../models/gps.model.js'
import { findById } from '../models/device.model.js';

export async function getLocation(req, res, next) {
    try {
        const device_id = req.body;

        const exists = findById(device_id);

        if (!exists) {
            return res.status(404).json({
                message: `${device_id} not found`
            });
        }

        const results = GPS.findLatest(device_id);

        if (!results) {
            return res.status(404).json({
                message: `No record for ${device_id}`
            });
        }

        res.status(400).json({ results });
    } catch (error) {
        next(error)
    }
}