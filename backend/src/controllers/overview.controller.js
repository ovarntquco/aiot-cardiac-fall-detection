import * as Device from "../models/device.model.js";
import { getLatestCardiacReading } from "../config/supabase.js";
import { resolveAuthorizedPatient } from "../services/access_control/patientAccess.js";

export default async function getOverview(req, res, next) {
  try {
    const accountId = req.user.accountId;

    if (!accountId) {
      return res.status(400).json({ message: "Missing required field: user.accountId" });
    }

    const patient = await resolveAuthorizedPatient({
      accountId,
      role: req.user.role,
      requestedPatientId: req.query.patientId,
    });

    if (!patient) {
      return res.status(200).json({
        patient: null,
        latestMeasurement: null,
        recentMeasurements: [],
        thresholds: null,
        healthStatus: { 
          overall: "UNKNOWN", 
          heartRate: "UNKNOWN", 
          spo2: "UNKNOWN" 
        },
      });
    }

    const device = await Device.findByPatientAccountId(patient.id);
    const reading = device ? await getLatestCardiacReading(device.id) : null;
    const latestMeasurement = reading ? mapReading(reading) : null;
    const thresholds = mapThresholds(patient);
    const healthStatus = calculateHealthStatus(latestMeasurement, thresholds);

    return res.status(200).json({
      patient: {
        id: patient.id,
        name: patient.full_name ?? undefined,
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
