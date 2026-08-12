import * as Account from "../models/account.model.js";

export default async function accessControl(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }
    
    const role = req.user.role;

    if (role === "caregiver") {
      console.log(req.query);
      const requestedPatientId = req.query.patientId;
      
      if (!requestedPatientId) {
        return res.status(400).json({ message: "Missing required query param: query.patientId" });
      }

      const patient = await Account.findById({ id: requestedPatientId });

      if (!patient) {
        return res.status(404).json({ message: "Patient's account not found" });
      }

      if (accountId !== patient.caregiver_account_id) {
        return res.status(403).json({ message: "Patient is not assigned to this caregiver" });
      }
      req.user.patientId = requestedPatientId;
    } else if (role === "patient") {
      req.user.patientId = accountId;
    }
    next();
  } catch (err) {
    next(err);
  }
}
