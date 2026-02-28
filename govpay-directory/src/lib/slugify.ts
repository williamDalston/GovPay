/**
 * Convert a string to a URL-safe slug.
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 *
 * @example
 * slugify("Department of Defense") // "department-of-defense"
 * slugify("John Smith Jr.") // "john-smith-jr"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
