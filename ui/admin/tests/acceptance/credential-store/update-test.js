/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | credential-stores | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'static',
    });
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'vault',
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.workerFilter = `${urls.credentialStores}/${instances.vaultCredentialStore.id}/worker-filter`;
    urls.editWorkerFilter = `${urls.credentialStores}/${instances.vaultCredentialStore.id}/edit-worker-filter`;
    await authenticateSession({});

    // Enable feature flag
    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('vault-worker-filter');
  });

  test('can save changes to existing static credential store', async function (assert) {
    assert.notEqual(instances.staticCredentialStore.name, 'random string');
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.staticCredentialStore);
    assert.strictEqual(
      this.server.schema.credentialStores.where({ type: 'static' }).models[0]
        .name,
      'random string',
    );
  });

  test('can save changes to existing vault credential store', async function (assert) {
    assert.notEqual(instances.vaultCredentialStore.name, 'random string');
    await visit(urls.vaultCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.vaultCredentialStore);
    assert.strictEqual(
      this.server.schema.credentialStores.where({ type: 'vault' }).models[0]
        .name,
      'random string',
    );
  });

  test('cannot make changes to an existing static credential store without proper authorization', async function (assert) {
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'update',
      );
    await visit(urls.staticCredentialStore);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('cannot make changes to an existing vault credential store without proper authorization', async function (assert) {
    instances.vaultCredentialStore.authorized_actions =
      instances.vaultCredentialStore.authorized_actions.filter(
        (item) => item !== 'update',
      );
    await visit(urls.vaultCredentialStore);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to existing static credential store', async function (assert) {
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.staticCredentialStore.name, 'random string');
    assert.strictEqual(
      find('[name="name"]').value,
      instances.staticCredentialStore.name,
    );
  });

  test('can cancel changes to existing vault credential store', async function (assert) {
    await visit(urls.vaultCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.vaultCredentialStore.name, 'random string');
    assert.strictEqual(
      find('[name="name"]').value,
      instances.vaultCredentialStore.name,
    );
  });

  test('saving an existing static credential store with invalid fields displays error messages', async function (assert) {
    this.server.patch('/credential-stores/:id', () => {
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
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
    assert.ok(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
    );
  });

  test('saving an existing vault credential store with invalid fields displays error messages', async function (assert) {
    this.server.patch('/credential-stores/:id', () => {
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
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.vaultCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
    assert.ok(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
    );
  });

  test('can discard unsaved static credential store changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.staticCredentialStore.name, 'random string');

    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.staticCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find(commonSelectors.MODAL_WARNING));
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');
      assert.strictEqual(currentURL(), urls.credentialStores);
      assert.notEqual(
        this.server.schema.credentialStores.where({ type: 'static' }).models[0]
          .name,
        'random string',
      );
    }
  });

  test('can discard unsaved vault credential store changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.vaultCredentialStore.name, 'random string');

    await visit(urls.vaultCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.vaultCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find(commonSelectors.MODAL_WARNING));
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');
      assert.strictEqual(currentURL(), urls.credentialStores);
      assert.notEqual(
        this.server.schema.credentialStores.where({ type: 'vault' }).models[0]
          .name,
        'random string',
      );
    }
  });

  test('can cancel discard unsaved static credential store via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.staticCredentialStore.name, 'random string');
    await visit(urls.staticCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.staticCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find(commonSelectors.MODAL_WARNING));
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);
      assert.strictEqual(currentURL(), urls.staticCredentialStore);
      assert.notEqual(
        this.server.schema.credentialStores.where({ type: 'static' }).models[0]
          .name,
        'random string',
      );
    }
  });

  test('can cancel discard unsaved vault credential store via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.vaultCredentialStore.name, 'random string');
    await visit(urls.vaultCredentialStore);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.vaultCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.ok(find(commonSelectors.MODAL_WARNING));
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);
      assert.strictEqual(currentURL(), urls.vaultCredentialStore);
      assert.notEqual(
        this.server.schema.credentialStores.where({ type: 'vault' }).models[0]
          .name,
        'random string',
      );
    }
  });

  test('visiting static credential store does not show worker filter tab', async function (assert) {
    await visit(urls.staticCredentialStore);

    assert.dom(commonSelectors.HREF(urls.workerFilter)).doesNotExist();
  });

  test('user can click vault credential store worker filter tab and be rerouted to correct url', async function (assert) {
    await visit(urls.vaultCredentialStore);

    assert.dom(commonSelectors.HREF(urls.workerFilter)).exists();

    await click(commonSelectors.HREF(urls.workerFilter));

    assert.strictEqual(currentURL(), urls.workerFilter);
  });

  test('manage actions dropdown displays edit option and routes to correct url', async function (assert) {
    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.HREF(urls.workerFilter));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.EDIT_ACTION);

    assert.strictEqual(currentURL(), urls.editWorkerFilter);
  });

  test('when work filters code editor is empty, save btn reroutes to empty state template', async function (assert) {
    instances.vaultCredentialStore.update({
      attributes: { worker_filter: null },
    });
    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.HREF(urls.workerFilter));

    assert.dom('.hds-application-state').exists();
    assert
      .dom('.hds-application-state')
      .hasText(
        `No worker filter added You haven't added a worker filter yet. Add Worker Filter`,
      );
  });

  test('when worker filter exists, readonly code block displays the filter text', async function (assert) {
    instances.vaultCredentialStore.update({
      attributes: { worker_filter: null },
    });

    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.HREF(urls.workerFilter));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.EDIT_ACTION);
    await fillIn(selectors.CODE_EDITOR_BODY, '"bar" in "/tags/foo"');
    await click(commonSelectors.SAVE_BTN);

    assert.dom(selectors.CODE_BLOCK_BODY).exists();
    assert.dom(selectors.CODE_BLOCK_BODY).includesText('"bar" in "/tags/foo"');
  });
});
