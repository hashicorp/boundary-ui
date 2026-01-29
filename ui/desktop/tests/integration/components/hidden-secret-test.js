/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
module('Integration | Component | hidden-secret', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  const HIDDEN_SECRET_TOGGLE = '.hidden-secret > button:first-child';
  const HIDDEN_SECRET_CONTENT = '.hidden-secret > .secret-content';

  // Global Secret for mocking
  this.secret = `{
    "secret_key": "QWERTYUIOP",
    "secret_access_key": "QWERT.YUIOP234567890",
    "nested_secret": {
      "session_token": "ZXCVBNMLKJHGFDSAQWERTYUIOP0987654321",
      "complex_nest": {
        "hash": "qazxswedcvfrtgbnjhyujm.1234567890"
      }
    }
  }`;

  async function renderComponent() {
    return render(hbs`
      <HiddenSecret
        @secret={{this.secret}}
      />
    `);
  }

  test('it renders with a secret', async function (assert) {
    assert.expect(1);
    await renderComponent();
    assert.dom(HIDDEN_SECRET_CONTENT).hasText('■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■');
  });

  test('it reveals secret when button is clicked', async function (assert) {
    assert.expect(1);
    await renderComponent();
    await click(HIDDEN_SECRET_TOGGLE);
    assert.dom(HIDDEN_SECRET_CONTENT).hasText(this.secret);
  });
});
