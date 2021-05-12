module.exports = {
  /**
   * Super paranoid shell quote/escape and validation.  Input must be base62.
   * @param {string} str
   */
  escapeAndValidate: (str) => {
    const candidate = str.toString();
    if (candidate.match(/^[A-Za-z0-9_]*$/)) return candidate;
    throw new Error(`
      Could not invoke command:
      input contained unsafe characters.
    `);
  },
};
