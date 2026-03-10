/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const SERVER_NAME = '[data-test-server-name]';
const SERVER_URL = '[data-test-server-url]';

module('Integration | Component | settings-card/server', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it displays HCP cluster url in server information section', async function (assert) {
    this.set('model', { serverInformation: 'boundary.hashicorp.cloud' });
    await render(hbs`<SettingsCard::Server @model={{this.model}}/>`);
    assert.dom(SERVER_NAME).hasText('HashiCorp Cloud Platform');
    assert.dom(SERVER_URL).hasText('boundary.hashicorp.cloud');
  });

  test('it displays non HCP cluster url in server information section', async function (assert) {
    this.set('model', { serverInformation: 'everythingelse' });
    await render(hbs`<SettingsCard::Server @model={{this.model}}/>`);
    assert.dom(SERVER_NAME).hasText('Self-managed');
    assert.dom(SERVER_URL).hasText('everythingelse');
  });
});
