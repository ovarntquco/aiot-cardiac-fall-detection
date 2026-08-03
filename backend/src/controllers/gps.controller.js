import * as Device from "../models/device.model.js";
import { getLatestGpsReading } from "../config/supabase.js";
import { resolveAuthorizedPatient } from "../services/access_control/patientAccess.js";

export default async function getLatestLocation(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const patient = await resolveAuthorizedPatient({
      accountId,
      role: req.user.role,
      requestedPatientId: req.query.patientId,
    });

    if (!patient) {
      return res.status(200).json({ patient: null, location: null });
    }

    const device = await Device.findByPatientAccountId(patient.id);
    if (!device) {
      return res.status(200).json({
        patient: { id: patient.id, name: patient.full_name ?? undefined },
        location: null,
      });
    }

    const reading = await getLatestGpsReading(device.id);

    return res.status(200).json({
      patient: { id: patient.id, name: patient.full_name ?? undefined },
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
