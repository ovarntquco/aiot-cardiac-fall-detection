/**
 * UC7 / FR9-FR11 request/response types.
 * @typedef {Object} PersonalThresholdUpdate
 * @property {number} heartRateMin
 * @property {number} heartRateMax
 * @property {number} spo2Min
 * @property {number} spo2Max
 *
 * @typedef {PersonalThresholdUpdate & { patientId: string }} PersonalThresholds
 *
 * @typedef {Object} ThresholdMetricLimits
 * @property {number} min
 * @property {number} max
 *
 * @typedef {Object} PersonalThresholdSettings
 * @property {PersonalThresholds} thresholds
 * @property {{ heartRate: ThresholdMetricLimits, spo2: ThresholdMetricLimits }} limits
 */

export {};
