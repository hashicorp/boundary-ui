/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const isLocalhost = (url) => {
  const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d{1,5}(?:\/|$)/i;
  return localhostRegex.test(url);
};

module.exports = isLocalhost;
