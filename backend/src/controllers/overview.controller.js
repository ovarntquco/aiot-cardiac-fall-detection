import * as Account from "../models/account.model.js";
import * as Device from "../models/device.model.js";
import { getLatestCardiacReading } from "../config/supabase.js";

function mapReading(reading) {
  return {
    heartRate: Number(reading.heart_rate),
    spo2: Number(reading.spo2),
    measuredAt: reading.recorded_at,
  };
}

function mapThresholds(patient) {
  if (patient.hr_low == null || patient.hr_high == null || patient.spo2_low == null) {
    return null;
  }

  return {
    heartRateMin: Number(patient.hr_low),
    heartRateMax: Number(patient.hr_high),
    spo2Min: Number(patient.spo2_low),
    spo2Max: 100,
  };
}

function calculateHealthStatus(measurement, thresholds) {
  if (!measurement || !thresholds) {
    return { 
      overall: "UNKNOWN", 
      heartRate: "UNKNOWN", 
      spo2: "UNKNOWN" 
    };
  }

  const heartRate = measurement.heartRate < thresholds.heartRateMin
    || measurement.heartRate > thresholds.heartRateMax
    ? "ABNORMAL"
    : "NORMAL";
  const spo2 = measurement.spo2 < thresholds.spo2Min
    || measurement.spo2 > thresholds.spo2Max
    ? "ABNORMAL"
    : "NORMAL";

  return {
    overall: heartRate === "ABNORMAL" || spo2 === "ABNORMAL" ? "ABNORMAL" : "NORMAL",
    heartRate,
    spo2,
  };
}

export default async function getOverview(req, res, next) {
  try {
    const patient = await Account.findById({ id: req.user.patientId });
    const device = await Device.findByPatientAccountId(patient.id);
    if (!device) {
      return res.status(404).json({ message: "Patient's device not found" });
    }

    const reading = await getLatestCardiacReading(device.id);
    const latestMeasurement = reading ? mapReading(reading) : null;
    const thresholds = mapThresholds(patient);
    const healthStatus = calculateHealthStatus(latestMeasurement, thresholds);

    return res.json({
      patient: {
        id: patient.id,
        name: patient.full_name,
      },
      latestMeasurement,
      recentMeasurements: latestMeasurement ? [latestMeasurement] : [],
      thresholds,
      healthStatus,
    });
  } catch (err) {
    next(err);
  }
}
