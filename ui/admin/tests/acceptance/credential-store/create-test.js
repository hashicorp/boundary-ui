/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | credential-stores | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;
  let getCredentialStoresCount;
  let getStaticCredentialStoresCount;
  let getVaultCredentialStoresCount;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };

  const urls = {
    credentialStores: null,
    newCredentialStore: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.credentialStores = `/scopes/${instances.scopes.project.id}/credential-stores`;
    urls.newCredentialStore = `${urls.credentialStores}/new`;
    // Generate resource counter
    getCredentialStoresCount = () => {
      return this.server.schema.credentialStores.all().models.length;
    };
    getStaticCredentialStoresCount = () => {
      return this.server.schema.credentialStores.where({ type: 'static' })
        .models.length;
    };
    getVaultCredentialStoresCount = () => {
      return this.server.schema.credentialStores.where({ type: 'vault' }).models
        .length;
    };
    featuresService = this.owner.lookup('service:features');
  });

  test('Users can create a new credential store of default type static', async function (assert) {
    featuresService.enable('static-credentials');
    const count = getStaticCredentialStoresCount();
    await visit(urls.newCredentialStore);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getStaticCredentialStoresCount(), count + 1);
  });

  test('Users can create a new credential store of type vault', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('static-credentials');
    const count = getVaultCredentialStoresCount();
    await visit(urls.newCredentialStore);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(selectors.TYPE_VAULT);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getVaultCredentialStoresCount(), count + 1);
  });

  test('Users can create a new credential store of type vault with a worker filter', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        label: {
          // [ember-a11y-ignore]: axe rule "label" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('static-credentials');
    featuresService.enable('worker-filter');
    const count = getVaultCredentialStoresCount();
    await visit(urls.newCredentialStore);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(selectors.TYPE_VAULT);
    await fillIn(
      commonSelectors.CODE_EDITOR_CONTENT,
      selectors.EDITOR_WORKER_FILTER_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.dom(selectors.CODE_BLOCK_BODY).doesNotExist();
    assert.strictEqual(getVaultCredentialStoresCount(), count + 1);
  });

  test('Users can cancel create new credential stores', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getCredentialStoresCount();
    await visit(urls.newCredentialStore);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.credentialStores);
    assert.strictEqual(getCredentialStoresCount(), count);
  });

  test('Users cannot navigate to new credential stores route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = [];
    await visit(urls.credentialStores);

    assert.notOk(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('create'),
    );
    assert.dom(commonSelectors.HREF(urls.newCredentialStore)).doesNotExist();
  });

  test('saving a new static credential store with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const errorMsg =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.post('/credential-stores', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
        },
      );
    });
    await visit(urls.newCredentialStore);

    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });

  test('saving a new vault credential store with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/credential-stores', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'attributes.address',
                description:
                  'Field required for creating a vault credential store.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.newCredentialStore);

    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert
      .dom(selectors.FIELD_VAULT_ADDRESS_ERROR)
      .hasText('Field required for creating a vault credential store.');
  });

  test('Users can link to docs page for new credential store', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.newCredentialStore);

    assert
      .dom(
        commonSelectors.HREF(
          'https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores',
        ),
      )
      .isVisible();
  });

  test('users cannot directly navigate to new credential store route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ] = instances.scopes.project.authorized_collection_actions[
      'credential-stores'
    ].filter((item) => item !== 'create');

    await visit(urls.newCredentialStore);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'credential-stores'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.credentialStores);
  });
});
