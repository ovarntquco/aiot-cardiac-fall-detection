import * as Account from "../models/account.model.js";
import * as Device from "../models/device.model.js";
import { getLatestGpsReading } from "../config/supabase.js";

export default async function getLatestLocation(req, res, next) {
  try {
    const patient = await Account.findById({ id: req.user.patientId });
    const device = await Device.findByPatientAccountId(patient.id);

    if (!device) {
      return res.status(404).json({ message: "Patient's device not found" });
    }

    const reading = await getLatestGpsReading(device.id);

    return res.status(200).json({
      patient: {
        id: patient.id,
        name: patient.full_name,
      },
      location: reading ? {
        latitude: Number(reading.latitude),
        longitude: Number(reading.longitude),
        recordedAt: reading.recorded_at,
      } : null,
    });
  } catch (err) {
    next(err);
  }
}
