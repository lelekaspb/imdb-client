/**
 * Normalizes API responses that may return:
 * - an array directly
 * - an object with `.data`
 * - an object with `.cast`
 *
 * Centralizes backend response normalization.
 */
export function normalizeList(input) {
    if (Array.isArray(input)) return input;
    return input?.data ?? input?.cast ?? [];
  }
  