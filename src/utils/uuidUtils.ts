
/**
 * Checks if a given string is a valid UUID v4.
 * @param id The string to validate.
 * @returns True if the string is a valid UUID v4, false otherwise.
 */
export function isUUIDv4(id: string | null | undefined): id is string {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return !!id && UUID_REGEX.test(id);
}
