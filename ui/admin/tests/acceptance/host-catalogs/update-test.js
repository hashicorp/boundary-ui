/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import {
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
} from 'api/models/host-catalog';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | update', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
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
  });

  test('can update static AWS credentials to Dynamic AWS credentials', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.AWSHostCatalogWithStaticCredential);
    await click(commonSelectors.EDIT_BTN);

    assert.dom(selectors.FIELD_STATIC_CREDENTIAL).isChecked();

    await click(
      selectors.FIELD_DYNAMIC_CREDENTIAL,
      selectors.FIELD_DYNAMIC_CREDENTIAL_VALUE,
    );
    await fillIn(selectors.FIELD_ROLE_ARN, selectors.FIELD_ROLE_ARN_VALUE);

    await click(commonSelectors.SAVE_BTN);

    // Check if the host catalog is updated
    assert.dom(selectors.FIELD_DYNAMIC_CREDENTIAL).isChecked();
  });

  test('can update GCP host catalog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.GCPHostCatalog);
    await click(commonSelectors.EDIT_BTN);
    await fillIn(selectors.FIELD_PROJECT, selectors.FIELD_PROJECT_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.hostCatalogs.where({ type: 'plugin' }).models[0]
        .attributes.project_id,
      selectors.FIELD_PROJECT_VALUE,
    );
  });

  test('can save changes to existing host catalog', async function (assert) {
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.hostCatalog);
    assert.strictEqual(
      this.server.schema.hostCatalogs.all().models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot make changes to an existing host catalog without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.hostCatalogs);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'update',
      );

    await click(commonSelectors.HREF(urls.hostCatalog));

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('clicking cancel in edit mode does not save changes', async function (assert) {
    await visit(urls.hostCatalog);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      instances.hostCatalog.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.hostCatalog.name);
  });

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    const errorMessage =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.patch('/host-catalogs/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
        },
      );
    });

    await visit(urls.hostCatalog);
    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
  });

  test('can discard unsaved host catalog changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(
      instances.hostCatalog.name,
      commonSelectors.FIELD_NAME_VALUE,
    );

    await visit(urls.hostCatalog);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.hostCatalog);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.MODAL_WARNING).exists();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.notEqual(
      this.server.schema.hostCatalogs.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can click cancel on discard dialog box for unsaved host catalog changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    assert.notEqual(
      instances.hostCatalog.name,
      commonSelectors.FIELD_NAME_VALUE,
    );

    await visit(urls.hostCatalog);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.hostCatalog);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert.dom(commonSelectors.MODAL_WARNING).exists();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

    assert.strictEqual(currentURL(), urls.hostCatalog);
    assert.notEqual(
      this.server.schema.hostCatalogs.all().models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });
});
