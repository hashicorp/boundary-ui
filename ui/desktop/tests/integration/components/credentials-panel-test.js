/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'desktop/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | credentials-panel', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

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

  test('it renders', async function (assert) {
    assert.expect(1);
    this.set('credentials', [credential]);

    await render(hbs`
      <CredentialsPanel @credentials={{this.credentials}} />
    `);

    assert.dom('.credential-name').hasText('Credential Library 1');
  });

  test('it shows code editor when toggle clicked', async function (assert) {
    assert.expect(1);
    this.set('credentials', [credential]);
    await render(hbs`
      <CredentialsPanel @credentials={{this.credentials}} />
    `);

    await click('[data-test-toggle-credentials]');

    assert.dom('.raw-secret').isVisible();
  });
});
