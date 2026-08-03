import * as Alert from "../models/alert.model.js"
import { resolveAuthorizedPatient } from "../services/access_control/patientAccess.js";

export default async function getAlertsByAccountId(req, res, next) {
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
      return res.status(200).json({ alerts: [] });
    }

    const alerts = await Alert.findAlertsByAccountId(patient.id);

    return res.status(200).json({ alerts });
  } catch (err) {
    next(err)
  }
}
