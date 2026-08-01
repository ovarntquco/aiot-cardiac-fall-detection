import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

const ACCOUNT_BASE = [
  "id", "full_name", "date_of_birth", "sex", "height", "weight",
  "hr_low", "hr_high", "spo2_low", "caregiver_account_id", "chat_id",
].join(", ");

const ACCOUNT_WITH_ROLE = [ACCOUNT_BASE, "user:users(role)"].join(", ");

export async function create({ userId, fullName, dateOfBirth, sex, height, weight }) {
  return runQuery(
    supabase
      .from("accounts")
      .insert({
        user_id: userId,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        sex, height, weight
      })
      .select(ACCOUNT_BASE)
      .single()
  );
}

export async function findById({ id, roleRequired = false }) {
  return runQuery(
    supabase
      .from("accounts")
      .select(roleRequired ? ACCOUNT_WITH_ROLE : ACCOUNT_BASE)
      .eq("id", id)
      .maybeSingle()
  );
}

export async function findByUserId(userId) {
  return runQuery(
    supabase
      .from("accounts")
      .select(ACCOUNT_BASE)
      .eq("user_id", userId)
      .maybeSingle
  );
}

export async function findByCaregiverAccountId(caregiverAccountId) {
  return runQuery(
    supabase
      .from("accounts")
      .select(ACCOUNT_SELECTED)
      .eq("caregiver_account_id", caregiverAccountId)
  );
}

export async function update({ id, updates }) {
  return runQuery(
    supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select(ACCOUNT_BASE)
      .single()
  );
}

export async function assignCaregiver({ id, caregiverAccountId }) {
  return update({ id, updates: { caregiver_account_id: caregiverAccountId } });
}

export async function updateVitalsThresholds({ id, hrLow, hrHigh, spo2Low }) {
  return update({
    id,
    updates: { hr_low: hrLow, hr_high: hrHigh, spo2_low: spo2Low },
  });
}

export async function updateChatId({ id, chatId }) {
  return update({ id, updates: { chat_id: chatId } });
}
