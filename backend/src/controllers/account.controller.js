import * as Account from "../models/account.model.js";
import * as User from "../models/user.model.js";

const ALLOWED_FIELDS = ["hrLow", "hrHigh", "spo2Low"];

export async function createAccount(req, res, next) {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "Missing required field: user.id" });
    }

    const { fullName, dateOfBirth, sex, height, weight } = req.body;
    const account = await Account.create({ userId, fullName, dateOfBirth, sex, height, weight, });

    res.status(201).json({ message: "Account created successfully", account });
  } catch (err) {
    next(err);
  }
}

export async function getMyAccount(req, res, next) {
  try {
    const id = req.user.accountId;

    if (!id) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const account = await Account.findById({ id });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ account });
  } catch (err) {
    next(err);
  }
}

export async function getPatientAccounts(req, res, next) {
  try {
    const caregiverAccountId = req.user.accountId;

    if (!caregiverAccountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const caregiver = await Account.findById({ id: caregiverAccountId, roleRequired: true });

    if (!caregiver) {
      return res.status(404).json({ message: "Account not found" });
    }
    if (caregiver.user.role !== "caregiver") {
      return res.status(403).json({ message: "Only caregiver can see their patients" });
    }

    const patients = await Account.findByCaregiverAccountId(caregiverAccountId);

    res.json({ patients });
  } catch (err) {
    next(err);
  }
}

export async function assignCaregiver(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const role = req.user.role;

    if (!role) {
      return res.status(400).json({ message: "Missing required field: user.role" });
    }
    if (role !== "patient") {
      return res.status(403).json({ message: "Only patient can assign a caregiver" });
    }

    const { caregiverAccountId } = req.body;
    const caregiver = await Account.findById({ id: caregiverAccountId });

    if (!caregiver) {
      return res.status(404).json({ message: "Account not found" });
    }
    if (caregiver.user.role !== "caregiver") {
      return res.status(403).json({ message: "Selected account is not a caregiver" });
    }

    const updated = await Account.assignCaregiver({
      id: req.user.accountId,
      caregiverAccountId,
    });

    res.json({ message: "Caregiver updated", caregiverAccount: updated.caregiver_account_id });
  } catch (err) {
    next(err);
  }
}

export async function updateVitalsThresholds(req, res, next) {
  try {
    const { patientAccountId } = req.params;

    if (!patientAccountId) {
      return res.status(400).json({ message: "Missing required parameter: patientAccountId" });
    }

    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const patient = await Account.findById({ id: patientAccountId });

    if (!patient) {
      return res.status(404).json({ message: "Patient account not found" });
    }
    if (patient.caregiver_account_id !== req.user.accountId) {
      return res.status(403).json({ message: "Only patient's caregiver can assign information" });
    }

    const updated = await Account.updateVitalsThresholds({
      id: patientAccountId,
      hrLow: updates["hrLow"],
      hrHigh: updates["hrHigh"],
      spo2Low: updates["spo2Low"],
    });

    res.json({
      message: "Patient updated successfully",
      patient: {
        accountId: updated.id,
        hrLow: updated.hr_low,
        hrHigh: updated.hr_high,
        spo2Low: updated.spo2_low,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateChatId(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const account = await Account.findById({ id: accountId });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const chatId = req.body;
    const updated = await Account.updateChatId({ accountId, chatId });

    res.json({
      message: "Patient updated successfully",
      patient: { accountId: updated.id, chatId: updated.chat_id },
    });
  } catch (err) {
    next(err);
  }
}
