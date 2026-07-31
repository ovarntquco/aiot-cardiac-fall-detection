import * as Alert from "../models/alert.model.js"
import * as Device from "../models/device.model.js"

export async function getAlerts(req, res, next) {
  try {
    const deviceId = req.body;

    const exist = await Device.findById(deviceId);
    
    if (!exist) {
      return res.status(404).json({
        message: `${deviceId} not found`
      });
    }

    const results = await Alert.findById(deviceId);

    if (!results) {
      return res.status(404).json({
        message: `No record found for ${deviceId}`
      });
    }

    res.status(200).json({ results });

  } catch (err) {
    next(err)
  }
}