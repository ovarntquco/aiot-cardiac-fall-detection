import { thresholdLimits } from "../../config/thresholds.js";

export function validateAndCleanCardiacReading(input) {
  const fields = {};

  const id = cleanIdentifier(input?.id, "id", fields);
  const patientId = cleanIdentifier(input?.patientId, "patientId", fields);
  const heartRate = cleanMetric(
    input?.heartRate,
    "heartRate",
    thresholdLimits.heartRate,
    fields,
  );
  const spo2 = cleanMetric(input?.spo2, "spo2", thresholdLimits.spo2, fields);
  const measuredAt = cleanTimestamp(input?.measuredAt, fields);

  if (Object.keys(fields).length > 0) {
    return { valid: false, fields };
  }

  return {
    valid: true,
    value: {
      id,
      patientId,
      heartRate,
      spo2,
      measuredAt,
    },
  };
}

function cleanIdentifier(value, field, fields) {
  if (typeof value !== "string" || !value.trim()) {
    fields[field] = "Value must be a non-empty string.";
    return null;
  }

  const cleaned = value.trim();
  if (cleaned.length > 128) {
    fields[field] = "Value must not exceed 128 characters.";
    return null;
  }
  return cleaned;
}

function cleanMetric(value, field, limits, fields) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fields[field] = "Value must be a finite number.";
    return null;
  }
  if (value < limits.min || value > limits.max) {
    fields[field] = `Value must be between ${limits.min} and ${limits.max}.`;
    return null;
  }
  return value;
}

function cleanTimestamp(value, fields) {
  if (typeof value !== "string" || !value.trim()) {
    fields.measuredAt = "Value must be a valid timestamp.";
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    fields.measuredAt = "Value must be a valid timestamp.";
    return null;
  }
  return new Date(timestamp).toISOString();
}
