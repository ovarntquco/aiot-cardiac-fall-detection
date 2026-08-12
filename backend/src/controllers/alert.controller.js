import * as Account from "../models/account.model.js";
import * as Alert from "../models/alert.model.js"

export default async function getAlertsByAccountId(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const patient = await Account.findById({id: req.user.patientId });
    const alerts = await Alert.findAlertsByAccountId(patient.id);

    return res.json({ alerts });
  } catch (err) {
    next(err)
  }
}
