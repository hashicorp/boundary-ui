/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * The Mulberry32 PRNG, JavaScript implementation.  This is a seedable PRNG,
 * which we need in order to deterministically generate IDs which are stable
 * across reloads.  Unfortunately, the built-in `Math.random` function
 * is not seedable.
 *
 * Source:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 *
 * @param {number} a
 * @return {number}
 */
function mulberry32(a = 0) {
  return function () {
    a += 0x6d2b79f5 | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32();

/**
 * Generates a random ID string at least 10 characters long with the
 * specified prefix.
 *
 * @param {string} prefix
 * @return {string}
 */
export default function (prefix = '') {
  let result = '';
  for (let i = 0; i < 10; i++) {
    result = result.concat(
      characters[Math.floor(random() * characters.length)],
    );
  }
  return prefix.concat(result);
}
