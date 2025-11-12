/**
 * Generates a random Base62 token of specified length
 * Base62 uses A-Z, a-z, 0-9 (62 total characters)
 * @param {number} length - Length of token to generate (default: 24)
 * @returns {string} Random Base62 token
 */
export function generateBase62Token(length = 24) {
  const base62Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => base62Chars[Math.floor(Math.random() * base62Chars.length)],
  ).join('');
}
