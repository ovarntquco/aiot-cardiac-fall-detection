/**
 * UC8 / FR12 rule-based detection types.
 * @typedef {Object} CardiacEvaluationInput
 * @property {string} id
 * @property {string} patientId
 * @property {number} heartRate
 * @property {number} spo2
 * @property {string} measuredAt
 *
 * @typedef {"LOW"|"NORMAL"|"HIGH"} MetricEvaluation
 *
 * @typedef {Object} CardiacEvaluation
 * @property {"NORMAL"|"ABNORMAL"} status
 * @property {MetricEvaluation} heartRate
 * @property {MetricEvaluation} spo2
 * @property {Array<{metric: "HEART_RATE"|"SPO2", direction: "LOW"|"HIGH", value: number, threshold: number}>} reasons
 */

export {};
