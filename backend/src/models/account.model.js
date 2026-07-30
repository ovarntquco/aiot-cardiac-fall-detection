import supabase from "../config/supabase.js";

const ACCOUNT_SELECTED = [
  'id',
  'user:users(role)',
  'full_name',
  'date_of_birth',
  'sex',
  'height',
  'weight',
  'hr_low',
  'hr_high',
  'spo2_low',
  'caregiver_account_id',
  'chat_id'
].join(', ');

export async function create({ userId, fullName, dateOfBirth, sex, height, weight }) {
  const { data, error } = await supabase
    .from('accounts')
    .insert({ user_id: userId, full_name: fullName, date_of_birth: dateOfBirth, sex, height, weight })
    .select()
    .single()

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findById(id) {
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_SELECTED)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findByUserId(userId) {
  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findByCaregiverAccountId(caregiverAccountId) {
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_SELECTED)
    .eq('caregiver_account_id', caregiverAccountId);
  
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function update({ id, updates }) {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function assignCaregiver({ id, caregiverAccountId }) {
  return update({ id, updates: { caregiver_account_id: caregiverAccountId } });
}

export async function updateVitalsThresholds({ id, hrLow, hrHigh, spo2Low }) {
  return update({ id, updates: { hr_low: hrLow, hr_high: hrHigh, spo2_low: spo2Low } });
}

export async function updateChatId({ id, chatId }) {
  return update({ id, updates: { chat_id: chatId } });
}