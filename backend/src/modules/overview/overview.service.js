import { overviewConfig } from "../../config/overview.js";

export async function getOverview({ repository, patientId, now }) {
  const currentTime = now();
  const [patient, latestMeasurement, recentMeasurements, thresholds, alertCountToday] = await Promise.all([
    repository.getPatient(patientId),
    repository.getLatestMeasurement(patientId),
    repository.getRecentMeasurements(patientId),
    repository.getThresholds(patientId),
    repository.countAlertsSince(patientId, startOfUtcDay(currentTime)),
  ]);

  const mappedThresholds = thresholds ? {
    heartRateMin: thresholds.heartRateMin,
    heartRateMax: thresholds.heartRateMax,
    spo2Min: thresholds.spo2Min,
    spo2Max: thresholds.spo2Max,
  } : null;
  const mappedLatestMeasurement = latestMeasurement ? {
    heartRate: latestMeasurement.heartRate,
    spo2: latestMeasurement.spo2,
    measuredAt: latestMeasurement.measuredAt,
  } : null;

  return {
    patient: patient ? {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      deviceStatus: patient.deviceStatus,
    } : null,
    latestMeasurement: mappedLatestMeasurement,
    recentMeasurements: recentMeasurements.map((measurement) => ({
      heartRate: measurement.heartRate,
      spo2: measurement.spo2,
      measuredAt: measurement.measuredAt,
    })),
    thresholds: mappedThresholds,
    healthStatus: getHealthStatus(mappedLatestMeasurement, mappedThresholds),
    dataFreshness: getDataFreshness(mappedLatestMeasurement, currentTime),
    alertCountToday,
  };
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getHealthStatus(measurement, thresholds) {
  if (!measurement || !thresholds) {
    return {
      overall: "UNKNOWN",
      heartRate: "UNKNOWN",
      spo2: "UNKNOWN",
    };
  }

  const heartRate = (
    measurement.heartRate < thresholds.heartRateMin
    || measurement.heartRate > thresholds.heartRateMax
  ) ? "ABNORMAL" : "NORMAL";
  const spo2 = (
    measurement.spo2 < thresholds.spo2Min
    || measurement.spo2 > thresholds.spo2Max
  ) ? "ABNORMAL" : "NORMAL";

  return {
    overall: heartRate === "ABNORMAL" || spo2 === "ABNORMAL" ? "ABNORMAL" : "NORMAL",
    heartRate,
    spo2,
  };
}

function getDataFreshness(measurement, currentTime) {
  if (!measurement) return null;

  const measuredAt = Date.parse(measurement.measuredAt);
  const staleAfterSeconds = overviewConfig.staleAfterMinutes * 60;

  if (!Number.isFinite(measuredAt)) {
    return {
      isStale: true,
      ageSeconds: null,
      staleAfterSeconds,
    };
  }

  const ageSeconds = Math.max(0, Math.floor((currentTime.getTime() - measuredAt) / 1000));
  return {
    isStale: ageSeconds > staleAfterSeconds,
    ageSeconds,
    staleAfterSeconds,
  };
}
