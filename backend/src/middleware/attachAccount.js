import * as Account from "../models/account.model.js";

export default async function attachAccount(req, res, next) {
  try {
    const userId = req.user.id;
    const account = await Account.findByUserId(userId);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    req.user.accountId = account.id;
    next();
  } catch (err) {
    next(err);
  }
}
