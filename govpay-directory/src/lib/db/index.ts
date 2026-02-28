/**
 * Database access layer - re-exports all domain-specific modules.
 *
 * This file provides backward compatibility with the original db.ts
 * while the actual implementation is split into domain-specific modules:
 * - agencies.ts - Agency queries
 * - employees.ts - Employee queries
 * - states.ts - State queries
 * - stats.ts - Statistics and distributions
 * - search.ts - Search and autocomplete
 * - utils.ts - Shared utilities and mappers
 */

// Agencies
export {
  getAgencies,
  getAllAgencies,
  getAgencyBySlug,
  getAgencySlugs,
  getAgencyAvgSalary,
  searchAgencies,
} from "./agencies";

// Employees
export {
  getEmployeeBySlug,
  getEmployeesByAgency,
  getEmployeesByState,
  getEmployeesByGrade,
  getTopEarners,
  getEmployeeCount,
  getEmployeeSlugs,
} from "./employees";

// States
export { getStateBySlug } from "./states";

// Stats
export {
  getSalaryDistribution,
  getSalaryDistributionForAgency,
  getGlobalStats,
  getNationalAvgSalary,
} from "./stats";

// Search
export { searchEmployees, getSuggestions } from "./search";
