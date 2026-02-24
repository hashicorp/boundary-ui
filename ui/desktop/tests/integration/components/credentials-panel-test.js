/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'desktop/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | credentials-panel', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const credential = {
    rawCredential: {
      credential_source: {
        id: 'clvlt_4cvscMTl0N',
        name: 'Credential Library 1',
        description: 'Source Description',
        credential_store_id: 'csvlt_Q1HFGt7Jpm',
        type: 'vault',
      },
      secret: {
        raw: 'anVzdC1hLXJhbmRvbS1zdHJpbmc=',
      },
    },
    source: {
      id: 'clvlt_4cvscMTl0N',
      name: 'Credential Library 1',
      description: 'Source Description',
      type: 'vault',
    },
    secrets: [
      {
        key: 'secret',
        value: 'just-a-random-string',
      },
    ],
  };

  const vaultCredentials = {
    source: {
      id: 'clvlt_4cvscMTl0N',
      name: 'Credential Library 2',
      description: 'Source Description',
      type: 'vault',
    },
    secrets: [
      {
        key: 'username',
        value: 'password',
      },
    ],
  };

  test('it renders', async function (assert) {
    assert.expect(1);
    this.set('credentials', [credential]);

    await render(hbs`
      <CredentialsPanel @credentials={{this.credentials}} />
    `);

    assert.dom('.credential-name').hasText('Credential Library 1');
  });

  test('it correctly shows parsed secret from vault', async function (assert) {
    this.set('credentials', [vaultCredentials]);

    await render(hbs`
      <CredentialsPanel @credentials={{this.credentials}} />
    `);
    assert.dom('.credential-name').hasText('Credential Library 2');
    assert.dom('.secret-container').isVisible();
    assert.dom('.secret-container span').hasText('username');
  });

  test('it shows code editor when toggle clicked', async function (assert) {
    assert.expect(1);
    this.set('credentials', [credential]);
    await render(hbs`
      <CredentialsPanel @credentials={{this.credentials}} />
    `);

    await click('[data-test-toggle-credentials]');

    assert.dom('[data-test-raw-secret]').isVisible();
  });
});
