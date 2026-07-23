export async function listAlerts({ repository, patientId }) {
  const alerts = await repository.getAlerts(patientId);
  return [...alerts]
    .sort((left, right) => alertTimestamp(right) - alertTimestamp(left))
    .map(toAlertSummary);
}

export async function getAlertDetail({ repository, alertId, user }) {
  const alert = await repository.getAlertById(alertId);
  if (!alert) {
    return { status: "not-found" };
  }

  if (!user.accessiblePatientIds.includes(alert.patientId)) {
    return { status: "forbidden" };
  }

  return {
    status: "ok",
    data: toAlertDetail(alert),
  };
}

function toAlertSummary(alert) {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status ?? null,
    message: alert.message,
    occurredAt: alert.occurredAt ?? alert.createdAt ?? null,
  };
}

function toAlertDetail(alert) {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status ?? null,
    message: alert.message,
    heartRate: alert.heartRate ?? null,
    spo2: alert.spo2 ?? null,
    fallProbability: alert.fallProbability ?? null,
    occurredAt: alert.occurredAt ?? alert.createdAt ?? null,
  };
}

function alertTimestamp(alert) {
  const timestamp = Date.parse(alert.occurredAt ?? alert.createdAt ?? "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}
