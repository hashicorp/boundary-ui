/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  find,
  waitFor,
} from '@ember/test-helpers';
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
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.workerFilter = `${urls.credentialStores}/${instances.vaultCredentialStore.id}/worker-filter`;
    urls.editWorkerFilter = `${urls.credentialStores}/${instances.vaultCredentialStore.id}/edit-worker-filter`;
    await authenticateSession({});

    // Enable feature flag
    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('worker-filter');
  });

  test('can save changes to existing static credential store', async function (assert) {
    assert.notEqual(instances.staticCredentialStore.name, 'random string');

    await visit(urls.staticCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.staticCredentialStore);
    assert.strictEqual(
      this.server.schema.credentialStores.where({ type: 'static' }).models[0]
        .name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can save changes to existing vault credential store', async function (assert) {
    assert.notEqual(instances.vaultCredentialStore.name, 'random string');

    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.vaultCredentialStore);
    assert.strictEqual(
      this.server.schema.credentialStores.where({ type: 'vault' }).models[0]
        .name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot make changes to an existing static credential store without proper authorization', async function (assert) {
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'update',
      );

    await visit(urls.staticCredentialStore);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('cannot make changes to an existing vault credential store without proper authorization', async function (assert) {
    instances.vaultCredentialStore.authorized_actions =
      instances.vaultCredentialStore.authorized_actions.filter(
        (item) => item !== 'update',
      );

    await visit(urls.vaultCredentialStore);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can cancel changes to existing static credential store', async function (assert) {
    await visit(urls.staticCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      instances.staticCredentialStore.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert
      .dom(commonSelectors.FIELD_NAME)
      .hasValue(instances.staticCredentialStore.name);
  });

  test('can cancel changes to existing vault credential store', async function (assert) {
    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      instances.vaultCredentialStore.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert
      .dom(commonSelectors.FIELD_NAME)
      .hasValue(instances.vaultCredentialStore.name);
  });

  test('saving an existing static credential store with invalid fields displays error messages', async function (assert) {
    const errorMsg =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.patch('/credential-stores/:id', () => {
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
    await visit(urls.staticCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });

  test('saving an existing vault credential store with invalid fields displays error messages', async function (assert) {
    const desc = 'Field required for creating a vault credential store.';
    const msg = 'The request was invalid';
    this.server.patch('/credential-stores/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: msg,
          details: {
            request_fields: [
              {
                name: 'attributes.address',
                description: desc,
              },
            ],
          },
        },
      );
    });
    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(selectors.FIELD_VAULT_ADDRESS, 'random string');
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(msg);
    assert.dom(selectors.FIELD_VAULT_ADDRESS_ERROR).hasText(desc);
  });

  test('can discard unsaved static credential store changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    assert.notEqual(
      instances.staticCredentialStore.name,
      commonSelectors.FIELD_NAME_VALUE,
    );

    await visit(urls.staticCredentialStore);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.staticCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).isVisible();

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

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.vaultCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).isVisible();

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

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.staticCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).isVisible();

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

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.vaultCredentialStore);

    try {
      await visit(urls.credentialStores);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).isVisible();

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

    assert.dom(commonSelectors.HREF(urls.workerFilter)).isVisible();

    await click(commonSelectors.HREF(urls.workerFilter));

    assert.strictEqual(currentURL(), urls.workerFilter);
  });

  test('manage actions dropdown displays edit option and routes to correct url', async function (assert) {
    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.HREF(urls.workerFilter));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.EDIT_WORKER_FILTER_ACTION);

    assert.strictEqual(currentURL(), urls.editWorkerFilter);
  });

  test('when work filters code editor is empty, save btn reroutes to empty state template', async function (assert) {
    instances.vaultCredentialStore.update({
      attributes: { worker_filter: null },
    });
    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.HREF(urls.workerFilter));

    assert
      .dom(commonSelectors.PAGE_MESSAGE_DESCRIPTION)
      .hasText("You haven't added a worker filter yet.");
    assert.dom(commonSelectors.PAGE_MESSAGE_LINK).hasText('Add Worker Filter');
  });

  test('when worker filter exists, readonly code block displays the filter text', async function (assert) {
    instances.vaultCredentialStore.update({
      attributes: { worker_filter: null },
    });

    await visit(urls.vaultCredentialStore);

    await click(commonSelectors.HREF(urls.workerFilter));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.EDIT_WORKER_FILTER_ACTION);
    await waitFor(selectors.CODE_EDITOR_CM_LOADED);

    const editorElement = find(selectors.CODE_EDITOR_BODY);
    const editorView = editorElement.editor;
    editorView.dispatch({
      changes: {
        from: editorView.state.selection.main.from,
        insert: '"bar" in "/tags/foo"',
      },
    });

    await click(commonSelectors.SAVE_BTN);

    assert.dom(selectors.CODE_BLOCK_BODY).exists();
    assert.dom(selectors.CODE_BLOCK_BODY).includesText('"bar" in "/tags/foo"');
  });
});
