/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

module.exports = {
  overrides: [
    {
      files: '*.{js,ts}',
      options: {
        singleQuote: true,
        printWidth: 80,
      },
    },
  ],
};
