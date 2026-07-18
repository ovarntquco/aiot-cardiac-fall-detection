export async function listAlerts({ repository, patientId }) {
  const alerts = await repository.getAlerts(patientId);
  return alerts.map(toAlertSummary);
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
    status: alert.status,
    message: alert.message,
    occurredAt: alert.occurredAt,
  };
}

function toAlertDetail(alert) {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    message: alert.message,
    heartRate: alert.heartRate,
    spo2: alert.spo2,
    fallProbability: alert.fallProbability,
    occurredAt: alert.occurredAt,
  };
}
