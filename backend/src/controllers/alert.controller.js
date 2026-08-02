import * as Alert from "../models/alert.model.js"

export default async function getAlertsByAccountId(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const alerts = await Alert.findAlertsByAccountId(accountId);
    
    if (alerts.length === 0) {
      return res.status(404).json({ message: `No alerts found for ${accountId}` });
    }

    res.json({ alerts });
  } catch (err) {
    next(err)
  }
}
