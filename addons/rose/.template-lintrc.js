'use strict';

module.exports = {
  extends: ['recommended', 'stylistic'],
  rules: {
    quotes: 'single',
    'self-closing-void-elements': false,
    'block-indentation': false,
  },
  overrides: [
    {
      files: [
        'addon/components/rose/anonymous/index.hbs',
        'addon/components/rose/table/row/cell/index.hbs',
      ],
      rules: {
        'no-yield-only': false,
      },
    },
    {
      files: ['addon/components/rose/dialog/index.hbs'],
      rules: {
        'no-duplicate-landmark-elements': false,
      },
    },
    {
      files: ['addon/components/rose/form/actions/index.hbs'],
      rules: {
        'no-passed-in-event-handlers': false,
      },
    },
  ],
};
