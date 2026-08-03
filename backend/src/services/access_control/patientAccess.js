import * as Account from "../../models/account.model.js";

export async function resolveAuthorizedPatient({ accountId, role, requestedPatientId }) {
  if (role === "patient") {
    if (requestedPatientId && requestedPatientId !== accountId) {
      const error = new Error("Patients can only access their own data");
      error.status = 403;
      throw error;
    }
    return Account.findById({ id: accountId });
  }

  if (role === "caregiver") {
    const patients = await Account.findByCaregiverAccountId(accountId);
    if (!requestedPatientId) return patients[0] ?? null;

    const patient = patients.find((candidate) => candidate.id === requestedPatientId);
    if (!patient) {
      const error = new Error("Patient is not assigned to this caregiver");
      error.status = 403;
      throw error;
    }
    return patient;
  }

  const error = new Error("Unsupported account role");
  error.status = 403;
  throw error;
}
