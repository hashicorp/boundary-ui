/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { visit, fillIn, click, currentURL } from '@ember/test-helpers';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | onboarding', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const urls = {
    onboarding: '/onboarding',
    success: '/onboarding/success',
    orgs: '/scopes/global/scopes',
  };

  test('show targetAddress and targetPort fields', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.onboarding);

    assert.dom(selectors.FIELD_TARGET_ADDRESS).isVisible();
    assert.dom(selectors.FIELD_TARGET_PORT).isVisible();
  });

  test('redirect user to success when fill targetAddress, targetPort and click Save', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.onboarding);

    await fillIn(
      selectors.FIELD_TARGET_ADDRESS,
      selectors.FIELD_TARGET_ADDRESS_VALUE,
    );
    await fillIn(
      selectors.FIELD_TARGET_PORT,
      selectors.FIELD_TARGET_PORT_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.success);
  });

  test('redirect user to orgs screen when click do this later', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.onboarding);

    await click(selectors.DO_THIS_LATER_BTN);

    assert.strictEqual(currentURL(), urls.orgs);
  });
});
