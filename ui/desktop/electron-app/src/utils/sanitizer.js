/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const { URL } = require('url');

module.exports = {
  /**
   * Super paranoid shell quote/escape and validation.  Input must be base62.
   * @param {string} str
   */
  base62EscapeAndValidate: (str) => {
    const candidate = str.toString();
    if (candidate.match(/^[A-Za-z0-9_]*$/)) return candidate;
    throw new Error(`
      Could not invoke command:
      input contained unsafe characters.
    `);
  },
  /**
   * Return a quoted string suitable for using in shell commands.
   * @param {string} str
   * @returns {string}
   */
  urlValidate: (str) => {
    try {
      const url = new URL(str);
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      // Parse error
      throw new Error(`URL ${str} could not be validated.`);
    }
  },
};
