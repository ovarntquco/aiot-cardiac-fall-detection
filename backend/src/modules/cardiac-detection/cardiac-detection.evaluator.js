export function evaluateCardiacReading(reading, thresholds) {
  const heartRate = evaluateMetric(
    reading.heartRate,
    thresholds.heartRateMin,
    thresholds.heartRateMax,
  );
  const spo2 = evaluateMetric(
    reading.spo2,
    thresholds.spo2Min,
    thresholds.spo2Max,
  );
  const reasons = [];

  if (heartRate !== "NORMAL") {
    reasons.push({
      metric: "HEART_RATE",
      direction: heartRate,
      value: reading.heartRate,
      threshold: heartRate === "LOW" ? thresholds.heartRateMin : thresholds.heartRateMax,
    });
  }
  if (spo2 !== "NORMAL") {
    reasons.push({
      metric: "SPO2",
      direction: spo2,
      value: reading.spo2,
      threshold: spo2 === "LOW" ? thresholds.spo2Min : thresholds.spo2Max,
    });
  }

  return {
    status: reasons.length > 0 ? "ABNORMAL" : "NORMAL",
    heartRate,
    spo2,
    reasons,
  };
}

function evaluateMetric(value, min, max) {
  if (value < min) return "LOW";
  if (value > max) return "HIGH";
  return "NORMAL";
}
