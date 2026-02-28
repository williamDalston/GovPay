/**
 * Database access layer.
 *
 * This file re-exports from the modular db/ directory for backward compatibility.
 * New code should import directly from @/lib/db (which resolves to db/index.ts).
 *
 * The implementation is split into domain-specific modules:
 * - db/agencies.ts - Agency queries
 * - db/employees.ts - Employee queries
 * - db/states.ts - State queries
 * - db/stats.ts - Statistics and distributions
 * - db/search.ts - Search and autocomplete
 * - db/utils.ts - Shared utilities and mappers
 */

export * from "./db/index";
