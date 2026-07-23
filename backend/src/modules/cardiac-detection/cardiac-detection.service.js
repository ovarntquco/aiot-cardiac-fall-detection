import { createHash } from "node:crypto";
import { evaluateCardiacReading } from "./cardiac-detection.evaluator.js";
import { validateAndCleanCardiacReading } from "./cardiac-detection.validation.js";

export async function processCardiacReading({
  input,
  repository,
  localAlertPublisher,
  now,
}) {
  const validation = validateAndCleanCardiacReading(input);
  if (!validation.valid) {
    return {
      status: "invalid",
      fields: validation.fields,
    };
  }

  const reading = validation.value;
  const thresholds = await repository.getThresholds(reading.patientId);
  if (!thresholds) {
    return { status: "thresholds-not-found" };
  }

  const evaluation = evaluateCardiacReading(reading, thresholds);
  const candidateAlert = evaluation.status === "ABNORMAL"
    ? createCardiacAlert({ reading, evaluation, confirmedAt: now() })
    : null;
  const persistence = await repository.saveCardiacEvaluation({
    reading,
    alert: candidateAlert,
  });
  const effectiveEvaluation = persistence.duplicate
    ? evaluateCardiacReading(persistence.reading, thresholds)
    : evaluation;
  let localAlertEventPublished = false;

  if (persistence.alertCreated) {
    await localAlertPublisher.publish({
      eventName: "CARDIAC_ABNORMALITY_CONFIRMED",
      patientId: persistence.alert.patientId,
      alertId: persistence.alert.id,
      readingId: persistence.alert.readingId,
      alertType: persistence.alert.type,
      action: "START",
      occurredAt: persistence.alert.occurredAt,
    });
    localAlertEventPublished = true;
  }

  return {
    status: "ok",
    data: {
      reading: persistence.reading,
      evaluation: effectiveEvaluation,
      alert: persistence.alert,
      duplicate: persistence.duplicate,
      localAlertEventPublished,
    },
  };
}

function createCardiacAlert({ reading, evaluation, confirmedAt }) {
  const reasonCodes = evaluation.reasons.map(
    (reason) => `${reason.metric}_${reason.direction}`,
  );
  const digest = createHash("sha256")
    .update(`${reading.patientId}:${reading.id}`)
    .digest("hex")
    .slice(0, 24);

  return {
    id: `CARDIAC_${digest}`,
    patientId: reading.patientId,
    readingId: reading.id,
    type: "CARDIAC_ABNORMAL",
    severity: reasonCodes.length > 1 ? "HIGH" : "MEDIUM",
    status: "NEW",
    message: `Phat hien bat thuong tim mach: ${reasonCodes.join(", ")}`,
    heartRate: reading.heartRate,
    spo2: reading.spo2,
    fallProbability: null,
    occurredAt: reading.measuredAt,
    confirmedAt: confirmedAt.toISOString(),
  };
}
