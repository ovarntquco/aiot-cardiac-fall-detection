import * as GPS from "../models/gps.model.js"

export async function getLocation(req, res, next) {
    try{
        const device_id = req.body;

        const results = await GPS.findLatest(device_id)

        if (!results) {
            return res.status(404).json({
                message: `No recorded data for ${device_id}`
            });
        };

        res.status(200).json({ results })
    } catch (err) {
        next(err);
    }
}