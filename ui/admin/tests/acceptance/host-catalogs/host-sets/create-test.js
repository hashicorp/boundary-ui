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
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | host sets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getHostSetCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    unknownHostSet: null,
    newHostSet: null,
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
    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.unknownHostSet = `${urls.hostSets}/foo`;
    urls.newHostSet = `${urls.hostSets}/new`;
    // Generate resource counter
    getHostSetCount = () => this.server.schema.hostSets.all().models.length;
  });

  test('can create new host sets', async function (assert) {
    const count = getHostSetCount();
    await visit(urls.newHostSet);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostSetCount(), count + 1);
  });

  test('can create new aws host set', async function (assert) {
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'plugin',
      plugin: {
        id: `plugin-id-1`,
        name: 'aws',
      },
    });

    const count = getHostSetCount();
    await visit(
      `${urls.hostCatalogs}/${instances.hostCatalog.id}/host-sets/new`,
    );
    const name = 'aws host set';
    await fillIn(commonSelectors.FIELD_NAME, name);
    await fillIn(selectors.FIELD_PREFERRED_ENDPOINT, 'endpoint');
    await click(selectors.FIELD_PREFERRED_ENDPOINT_ADD_BTN);
    await fillIn(selectors.FIELD_FILTERS, 'filter_test');
    await click(selectors.FIELD_FILTERS_ADD_BTN);

    await fillIn(selectors.FIELD_SYNC_INTERVAL, 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostSetCount(), count + 1);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.deepEqual(hostSet.preferredEndpoints, ['endpoint']);
    assert.deepEqual(hostSet.attributes.filters, ['filter_test']);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can create new azure host set', async function (assert) {
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'plugin',
      plugin: {
        id: `plugin-id-1`,
        name: 'azure',
      },
    });

    const count = getHostSetCount();
    await visit(
      `${urls.hostCatalogs}/${instances.hostCatalog.id}/host-sets/new`,
    );
    const name = 'azure host set';
    await fillIn(commonSelectors.FIELD_NAME, name);
    await fillIn(selectors.FIELD_PREFERRED_ENDPOINT, 'endpoint');
    await click(selectors.FIELD_PREFERRED_ENDPOINT_ADD_BTN);
    await fillIn(selectors.FIELD_AZURE_FILTER, 'filter');
    await fillIn(selectors.FIELD_SYNC_INTERVAL, 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostSetCount(), count + 1);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.deepEqual(hostSet.preferredEndpoints, ['endpoint']);
    assert.deepEqual(hostSet.attributes.filter, 'filter');
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can create new gcp host set', async function (assert) {
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'plugin',
      plugin: {
        id: `plugin-id-1`,
        name: 'gcp',
      },
    });

    const count = getHostSetCount();
    await visit(
      `${urls.hostCatalogs}/${instances.hostCatalog.id}/host-sets/new`,
    );
    const name = 'gcp host set';
    await fillIn(commonSelectors.FIELD_NAME, name);
    await fillIn(selectors.FIELD_PREFERRED_ENDPOINT, 'endpoint');
    await click(selectors.FIELD_PREFERRED_ENDPOINT_ADD_BTN);
    await fillIn(selectors.FIELD_FILTERS, 'filter_test');
    await click(selectors.FIELD_FILTERS_ADD_BTN);

    await fillIn(selectors.FIELD_SYNC_INTERVAL, 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostSetCount(), count + 1);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.deepEqual(hostSet.preferredEndpoints, ['endpoint']);
    assert.deepEqual(hostSet.attributes.filters, ['filter_test']);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('Users cannot create a new host set without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.hostCatalog.authorized_collection_actions['host-sets'] =
      instances.hostCatalog.authorized_collection_actions['host-sets'].filter(
        (item) => item !== 'create',
      );
    await visit(urls.hostCatalog);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);

    assert.notOk(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newHostSet)).doesNotExist();
  });

  test('Users cannot navigate to new host sets route without proper authorization', async function (assert) {
    instances.hostCatalog.authorized_collection_actions['host-sets'] = [];
    await visit(urls.hostSets);

    assert.notOk(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newHostSet)).doesNotExist();
  });

  test('can cancel create new host', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostSetCount();
    await visit(urls.newHostSet);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.hostSets);
    assert.strictEqual(getHostSetCount(), count);
  });

  test('saving a new host set with invalid fields displays error messages', async function (assert) {
    const errorMsg =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.post('/host-sets', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
          details: {
            request_fields: [
              {
                name: 'name',
                description: errorMsg,
              },
            ],
          },
        },
      );
    });
    await visit(urls.newHostSet);

    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });

  test('users cannot directly navigate to new host set route without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.hostCatalog.authorized_collection_actions['host-sets'] =
      instances.hostCatalog.authorized_collection_actions['host-sets'].filter(
        (item) => item !== 'create',
      );

    await visit(urls.newHostSet);

    assert.false(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.hostSets);
  });
});
