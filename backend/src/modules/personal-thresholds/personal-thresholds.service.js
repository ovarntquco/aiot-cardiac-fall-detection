import { defaultThresholds, thresholdLimits } from "../../config/thresholds.js";

const thresholdFields = ["heartRateMin", "heartRateMax", "spo2Min", "spo2Max"];

export async function getPersonalThresholds({ repository, patientId }) {
  const thresholds = await repository.getThresholds(patientId);
  if (!thresholds) return { status: "not-found" };

  return {
    status: "ok",
    data: toSettingsResponse(thresholds),
  };
}

export async function updatePersonalThresholds({ repository, patientId, input }) {
  const validation = validateThresholds(input);
  if (!validation.valid) {
    return {
      status: "invalid",
      fields: validation.fields,
    };
  }

  const thresholds = await repository.updateThresholds(patientId, validation.values);
  return {
    status: "ok",
    data: toSettingsResponse(thresholds),
  };
}

export async function restoreDefaultThresholds({ repository, patientId }) {
  const thresholds = await repository.updateThresholds(patientId, defaultThresholds);
  return {
    status: "ok",
    data: toSettingsResponse(thresholds),
  };
}

export function validateThresholds(input) {
  const fields = {};
  const values = {};

  for (const field of thresholdFields) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      fields[field] = "Value must be a valid number.";
    } else {
      values[field] = value;
    }
  }

  validateMetricRange({
    fields,
    values,
    minField: "heartRateMin",
    maxField: "heartRateMax",
    limits: thresholdLimits.heartRate,
    label: "Heart rate",
  });
  validateMetricRange({
    fields,
    values,
    minField: "spo2Min",
    maxField: "spo2Max",
    limits: thresholdLimits.spo2,
    label: "SpO2",
  });

  return {
    valid: Object.keys(fields).length === 0,
    fields,
    values,
  };
}

function validateMetricRange({ fields, values, minField, maxField, limits, label }) {
  const min = values[minField];
  const max = values[maxField];

  if (min !== undefined && (min < limits.min || min > limits.max)) {
    fields[minField] = `${label} must be between ${limits.min} and ${limits.max}.`;
  }
  if (max !== undefined && (max < limits.min || max > limits.max)) {
    fields[maxField] = `${label} must be between ${limits.min} and ${limits.max}.`;
  }

  if (
    min !== undefined
    && max !== undefined
    && !fields[minField]
    && !fields[maxField]
    && min >= max
  ) {
    fields[minField] = "Minimum must be lower than maximum.";
    fields[maxField] = "Maximum must be higher than minimum.";
  }
}

function toSettingsResponse(thresholds) {
  return {
    thresholds: {
      patientId: thresholds.patientId,
      heartRateMin: thresholds.heartRateMin,
      heartRateMax: thresholds.heartRateMax,
      spo2Min: thresholds.spo2Min,
      spo2Max: thresholds.spo2Max,
    },
    limits: {
      heartRate: { ...thresholdLimits.heartRate },
      spo2: { ...thresholdLimits.spo2 },
    },
  };
}
