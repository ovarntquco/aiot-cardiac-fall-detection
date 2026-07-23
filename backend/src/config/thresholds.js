function readConfiguredNumber(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") return fallback;

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number.`);
  }

  return value;
}

// These are configurable system input constraints, not medical recommendations.
export const thresholdLimits = Object.freeze({
  heartRate: Object.freeze({
    min: readConfiguredNumber("CAREWATCH_HEART_RATE_LIMIT_MIN", 1),
    max: readConfiguredNumber("CAREWATCH_HEART_RATE_LIMIT_MAX", 300),
  }),
  spo2: Object.freeze({
    min: readConfiguredNumber("CAREWATCH_SPO2_LIMIT_MIN", 0),
    max: readConfiguredNumber("CAREWATCH_SPO2_LIMIT_MAX", 100),
  }),
});

// Operational defaults can be overridden without changing application code.
// They must not be presented as clinical guidance.
export const defaultThresholds = Object.freeze({
  heartRateMin: readConfiguredNumber("CAREWATCH_DEFAULT_HEART_RATE_MIN", 60),
  heartRateMax: readConfiguredNumber("CAREWATCH_DEFAULT_HEART_RATE_MAX", 100),
  spo2Min: readConfiguredNumber("CAREWATCH_DEFAULT_SPO2_MIN", 95),
  spo2Max: readConfiguredNumber("CAREWATCH_DEFAULT_SPO2_MAX", 100),
});

validateConfiguration();

function validateConfiguration() {
  if (thresholdLimits.heartRate.min >= thresholdLimits.heartRate.max) {
    throw new Error("Heart-rate system limits are invalid.");
  }
  if (thresholdLimits.spo2.min >= thresholdLimits.spo2.max) {
    throw new Error("SpO2 system limits are invalid.");
  }

  const defaultPairs = [
    ["heartRate", defaultThresholds.heartRateMin, defaultThresholds.heartRateMax],
    ["spo2", defaultThresholds.spo2Min, defaultThresholds.spo2Max],
  ];

  for (const [metric, min, max] of defaultPairs) {
    const limits = thresholdLimits[metric];
    if (min >= max || min < limits.min || max > limits.max) {
      throw new Error(`${metric} default thresholds are outside the configured system limits.`);
    }
  }
}
