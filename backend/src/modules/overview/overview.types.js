/**
 * UC3 / FR4 implemented response contract.
 * @typedef {Object} LatestMeasurement
 * @property {number} heartRate
 * @property {number} spo2
 * @property {string} measuredAt
 *
 * @typedef {"NORMAL" | "ABNORMAL" | "UNKNOWN"} HealthStatusValue
 *
 * @typedef {Object} OverviewHealthStatus
 * @property {HealthStatusValue} overall
 * @property {HealthStatusValue} heartRate
 * @property {HealthStatusValue} spo2
 *
 * @typedef {Object} DataFreshness
 * @property {boolean} isStale
 * @property {number | null} ageSeconds
 * @property {number} staleAfterSeconds
 *
 * @typedef {Object} PersonalThresholds
 * @property {number} heartRateMin
 * @property {number} heartRateMax
 * @property {number} spo2Min
 * @property {number} spo2Max
 */

export {};
