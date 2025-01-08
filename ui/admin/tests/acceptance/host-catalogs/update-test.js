/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import {
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
} from 'api/models/host-catalog';

module('Acceptance | host-catalogs | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    GCPHostCatalog: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    AWSHostCatalogWithStaticCredential: null,
    GCPHostCatalog: null,
  };

  const NAME_INPUT_SELECTOR = '[name="name"]';
  const EDIT_BUTTON_SELECTOR = '.rose-form-actions [type=button]';
  const SAVE_BUTTON_SELECTOR = '.rose-form-actions [type="submit"]';
  const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const CREDENTIAL_TYPE_SELECTOR =
    '.dynamic-credential-selection input:checked';

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
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    instances.GCPHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: TYPE_HOST_CATALOG_DYNAMIC,
      plugin: { name: TYPE_HOST_CATALOG_PLUGIN_GCP },
    });

    instances.AWSHostCatalogWithStaticCredential = this.server.create(
      'host-catalog',
      {
        scope: instances.scopes.project,
        type: TYPE_HOST_CATALOG_DYNAMIC,
        plugin: { name: TYPE_HOST_CATALOG_PLUGIN_AWS },
        credentialType: 'static-credential',
      },
    );
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.AWSHostCatalogWithStaticCredential = `${urls.hostCatalogs}/${instances.AWSHostCatalogWithStaticCredential.id}`;
    urls.GCPHostCatalog = `${urls.hostCatalogs}/${instances.GCPHostCatalog.id}`;
    await authenticateSession({});
  });

  test('can update static AWS credentials to Dynamic AWS credentials', async function (assert) {
    await visit(urls.AWSHostCatalogWithStaticCredential);
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');

    assert.strictEqual(
      find(CREDENTIAL_TYPE_SELECTOR).value,
      'static-credential',
    );
    await click('[value=dynamic-credential]', 'Dynamic Credential');
    await fillIn('[name=role_arn]', 'arn:aws:iam');

    await click(SAVE_BUTTON_SELECTOR);
    // Check if the host catalog is updated
    assert.strictEqual(
      find(CREDENTIAL_TYPE_SELECTOR).value,
      'dynamic-credential',
    );
  });

  test('can update GCP host catalog', async function (assert) {
    await visit(urls.GCPHostCatalog);
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn('[name=project_id]', 'project-id');
    await click(SAVE_BUTTON_SELECTOR);

    assert.strictEqual(
      this.server.schema.hostCatalogs.where({ type: 'plugin' }).models[0]
        .attributes.project_id,
      'project-id',
    );
  });

  test('can save changes to existing host catalog', async function (assert) {
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(SAVE_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.hostCatalog);
    assert.strictEqual(
      this.server.schema.hostCatalogs.all().models[0].name,
      'random string',
    );
  });

  test('cannot make changes to an existing host catalog without proper authorization', async function (assert) {
    await visit(urls.hostCatalogs);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'update',
      );

    await click(`[href="${urls.hostCatalog}"]`);

    assert.dom(EDIT_BUTTON_SELECTOR).doesNotExist();
  });

  test('clicking cancel in edit mode does not save changes', async function (assert) {
    await visit(urls.hostCatalog);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR, 'Click Cancel');

    assert.notEqual(instances.hostCatalog.name, 'random string');
    assert.dom(NAME_INPUT_SELECTOR).hasValue(instances.hostCatalog.name);
  });

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    this.server.patch('/host-catalogs/:id', () => {
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

    await visit(urls.hostCatalog);
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click('[type="submit"]');

    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
    assert.dom('[data-test-error-message-name]').hasText('Name is required.');
  });

  test('can discard unsaved host catalog changes via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    assert.strictEqual(currentURL(), urls.hostCatalog);
    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom(commonSelectors.MODAL_WARNING).exists();
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.notEqual(
      this.server.schema.hostCatalogs.first().name,
      'random string',
    );
  });

  test('can click cancel on discard dialog box for unsaved host catalog changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    assert.strictEqual(currentURL(), urls.hostCatalog);
    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom(commonSelectors.MODAL_WARNING).exists();
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

    assert.strictEqual(currentURL(), urls.hostCatalog);
    assert.notEqual(
      this.server.schema.hostCatalogs.all().models[0].name,
      'random string',
    );
  });
});
