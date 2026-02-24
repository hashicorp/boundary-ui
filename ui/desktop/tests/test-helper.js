/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Application from 'desktop/app';
import config from 'desktop/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import start from 'ember-exam/test-support/start';
import {
  DEFAULT_A11Y_TEST_HELPER_NAMES,
  setRunOptions,
  setupGlobalA11yHooks,
  setupQUnitA11yAuditToggle,
  shouldForceAudit,
  setEnableA11yAudit,
  useMiddlewareReporter,
  setupMiddlewareReporter,
} from 'ember-a11y-testing/test-support';

setApplication(Application.create(config.APP));

setupGlobalA11yHooks(() => true, {
  helpers: [
    ...DEFAULT_A11Y_TEST_HELPER_NAMES,
    'fillIn',
    'render',
    'tab',
    'focus',
    'select',
  ],
});

setupQUnitA11yAuditToggle(QUnit);

const runOnly =
  config.COLOR_THEME === 'dark'
    ? 'color-contrast'
    : {
        type: 'tag',
        values: [
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22aa',
          'best-practice',
        ],
      };

setRunOptions({
  runOnly,
  include: [['#ember-testing-container']],
  exclude: [['.flight-sprite-container']],
});

// This will be used by developers to run the tests locally
// Either with the `enableA11yAudit` as a query param in the URL
// or `pnpm test-a11y` in the CLI
// Note: if you want to filter what test is run from the start, use the --filter flag: `pnpm test-a11y --filter="alert"`
// Docs: https://guides.emberjs.com/release/testing/#toc_how-to-filter-tests
if (shouldForceAudit()) {
  setEnableA11yAudit(true);
}

// Note, as a convenience, useMiddlewareReporter automatically forces audits, thus explicitly specifying the enableA11yAudit query param or the ENABLE_A11Y_AUDIT environment variable is unnecessary.
if (useMiddlewareReporter()) {
  // Only runs if `enableA11yMiddlewareReporter` is set in URL
  setupMiddlewareReporter();
}

setup(QUnit.assert);

start();
