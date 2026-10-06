/**
 * Tipos del contrato del módulo home (fuente de verdad: DTOs del backend).
 *
 * @typedef {"OWNER" | "MEMBER"} Role
 *
 * @typedef {Object} Home
 * @property {string} idHome
 * @property {string} name
 * @property {string} homeTypeId
 * @property {string} address
 * @property {string} accessCode
 * @property {string | null} description
 * @property {string} creationDate  ISO-8601
 *
 * @typedef {Home & { role: Role, favorite: boolean }} HomeMembership
 *   Elemento de GET /homes: hogar + rol y favorito del usuario actual.
 *
 * @typedef {Object} UserHome
 * @property {string} userId
 * @property {string} homeId
 * @property {Role} role
 * @property {boolean} favorite
 *
 * @typedef {Object} HomeThresholds
 * @property {string} idThreshold
 * @property {string} homeId
 * @property {number} dailyLimit    kWh
 * @property {number} monthlyLimit  kWh
 * @property {boolean} useSystemDefault
 *
 * @typedef {Object} HomeType
 * @property {string} idHomeType
 * @property {string} name
 *
 * @typedef {Object} CreateHomeRequest
 * @property {string} name
 * @property {string} homeTypeId
 * @property {string} address
 * @property {string} [description]
 *
 * @typedef {Object} JoinHomeRequest
 * @property {string} accessCode
 *
 * @typedef {Object} UpdateThresholdsRequest
 * @property {number} dailyLimit
 * @property {number} monthlyLimit
 */

export {};
