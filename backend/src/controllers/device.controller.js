import * as Device from "../models/device.model.js";
import * as Account from "../models/account.model.js";

export async function createDevice(req, res, next) {
  try {
    const { patientAccountId } = req.body;
    const patient = await Account.findById({ id: patientAccountId, roleRequired: true });

    if (!patient) {
      return res.status(404).json({ message: "Patient's account not found" });
    }
    if (patient.user.role !== "patient") {
      return res.status(403).json({ message: "Only add patient account Id" });
    }

    const device = await Device.create(patientAccountId);

    res.json({ message: "Device created successfully", device });
  } catch (err) {
    next(err);
  }
}
