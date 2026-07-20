export async function getOverview({ repository, patientId, now }) {
  const [patient, latestMeasurement, recentMeasurements, thresholds, alertCountToday] = await Promise.all([
    repository.getPatient(patientId),
    repository.getLatestMeasurement(patientId),
    repository.getRecentMeasurements(patientId),
    repository.getThresholds(patientId),
    repository.countAlertsSince(patientId, startOfUtcDay(now())),
  ]);

  return {
    patient,
    latestMeasurement: latestMeasurement ? {
      heartRate: latestMeasurement.heartRate,
      spo2: latestMeasurement.spo2,
      measuredAt: latestMeasurement.measuredAt,
    } : null,
    recentMeasurements: recentMeasurements.map((measurement) => ({
      heartRate: measurement.heartRate,
      spo2: measurement.spo2,
      measuredAt: measurement.measuredAt,
    })),
    thresholds: thresholds ? {
      heartRateMin: thresholds.heartRateMin,
      heartRateMax: thresholds.heartRateMax,
      spo2Min: thresholds.spo2Min,
      spo2Max: thresholds.spo2Max,
    } : null,
    alertCountToday,
  };
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
