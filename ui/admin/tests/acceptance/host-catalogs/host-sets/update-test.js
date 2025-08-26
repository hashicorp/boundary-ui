/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  find,
  findAll,
  click,
  fillIn,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | host sets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
      awsHostCatalog: null,
      awsHostSet: null,
      azureHostCatalog: null,
      azureHostSet: null,
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
    awshostSet: null,
    azureHostSet: null,
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
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });

    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    instances.awsHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'plugin',
      plugin: {
        id: `plugin-id-1`,
        name: 'aws',
      },
    });
    instances.awsHostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.awsHostCatalog,
    });

    instances.azureHostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'plugin',
      plugin: {
        id: `plugin-id-1`,
        name: 'azure',
      },
    });
    instances.azureHostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.azureHostCatalog,
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
    urls.awshostSet = `${urls.hostCatalogs}/${instances.awsHostCatalog.id}/host-sets/${instances.awsHostSet.id}`;
    urls.azureHostSet = `${urls.hostCatalogs}/${instances.azureHostCatalog.id}/host-sets/${instances.azureHostSet.id}`;
    // Generate resource couner
    await authenticateSession({});
  });

  test('saving a new host set with invalid fields displays error messages', async function (assert) {
    const mockMessage = 'The request was invalid.';
    const mockDescription = 'Name is required.';
    this.server.post('/host-sets', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: mockMessage,
          details: {
            request_fields: [
              {
                name: 'name',
                description: mockDescription,
              },
            ],
          },
        },
      );
    });
    await visit(urls.newHostSet);

    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(mockMessage);
    assert.ok(
      find(commonSelectors.FIELD_NAME_ERROR).textContent.trim(),
      mockDescription,
    );
  });

  test('can save changes to existing host-set', async function (assert) {
    const mockName = 'random string';
    assert.notEqual(instances.hostSet.name, mockName);
    await visit(urls.hostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, mockName);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.hostSet);
    assert.strictEqual(this.server.schema.hostSets.first().name, mockName);
  });

  test('can save changes to an existing aws host-set', async function (assert) {
    const mockName = 'aws host set';
    const mockEndpoint = 'sample endpoint';
    const mockFilter = 'sample filters';
    await visit(urls.awshostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, mockName);

    const endpointList = findAll(selectors.FIELD_PREFERRED_ENDPOINT_DELETE_BTN);
    for (const element of endpointList) {
      await click(element);
    }

    assert.strictEqual(
      findAll(selectors.FIELD_PREFERRED_ENDPOINT_DELETE_BTN).length,
      0,
    );

    await fillIn(selectors.FIELD_PREFERRED_ENDPOINT, mockEndpoint);
    await click(selectors.FIELD_PREFERRED_ENDPOINT_ADD_BTN);

    const filterList = await Promise.all(
      findAll(selectors.FIELD_FILTERS_REMOVE_BTN),
    );
    for (const element of filterList) {
      await click(element);
    }

    assert.strictEqual(findAll(selectors.FIELD_FILTERS_REMOVE_BTN).length, 0);

    await fillIn(selectors.FIELD_FILTERS, mockFilter);
    await click(selectors.FIELD_FILTERS_ADD_BTN);
    await fillIn(selectors.FIELD_SYNC_INTERVAL, 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.awshostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name: mockName });
    assert.strictEqual(hostSet.name, mockName);
    assert.deepEqual(hostSet.preferredEndpoints, [mockEndpoint]);
    assert.deepEqual(hostSet.attributes.filters, [mockFilter]);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can save changes to an existing azure host-set', async function (assert) {
    const mockName = 'azure host set';
    const mockEndpoint = 'sample endpoints';
    await visit(urls.azureHostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, mockName);

    // Remove all the preferred endpoints
    const endpointList = findAll(selectors.FIELD_PREFERRED_ENDPOINT_DELETE_BTN);
    for (const element of endpointList) {
      await click(element);
    }

    assert.strictEqual(
      findAll(selectors.FIELD_PREFERRED_ENDPOINT_DELETE_BTN).length,
      0,
    );

    await fillIn(selectors.FIELD_PREFERRED_ENDPOINT, mockEndpoint);
    await click(selectors.FIELD_PREFERRED_ENDPOINT_ADD_BTN);
    await fillIn(selectors.FIELD_AZURE_FILTER, 'filter');
    await fillIn(selectors.FIELD_SYNC_INTERVAL, 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.azureHostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name: mockName });
    assert.strictEqual(hostSet.name, mockName);
    assert.deepEqual(hostSet.preferredEndpoints, [mockEndpoint]);
    assert.deepEqual(hostSet.attributes.filter, 'filter');
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can save changes to an existing gcp host-set', async function (assert) {
    const mockName = 'gcp host set';
    await visit(urls.awshostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, mockName);

    const endpointList = findAll(selectors.FIELD_PREFERRED_ENDPOINT_DELETE_BTN);
    for (const element of endpointList) {
      await click(element);
    }

    assert.strictEqual(
      findAll(selectors.FIELD_PREFERRED_ENDPOINT_DELETE_BTN).length,
      0,
    );

    await fillIn(selectors.FIELD_PREFERRED_ENDPOINT, 'sample endpoint');
    await click(selectors.FIELD_PREFERRED_ENDPOINT_ADD_BTN);

    // Remove all the filters
    const filterList = await Promise.all(
      findAll(selectors.FIELD_FILTERS_REMOVE_BTN),
    );
    for (const element of filterList) {
      await click(element);
    }

    assert.strictEqual(findAll(selectors.FIELD_FILTERS_REMOVE_BTN).length, 0);

    await fillIn(selectors.FIELD_FILTERS, 'sample filters');
    await click(selectors.FIELD_FILTERS_ADD_BTN);
    await fillIn(selectors.FIELD_SYNC_INTERVAL, 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.awshostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name: mockName });
    assert.strictEqual(hostSet.name, mockName);
    assert.deepEqual(hostSet.preferredEndpoints, ['sample endpoint']);
    assert.deepEqual(hostSet.attributes.filters, ['sample filters']);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('cannot make changes to an existing host without proper authorization', async function (assert) {
    instances.hostSet.authorized_actions =
      instances.hostSet.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.hostSet);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can cancel changes to existing host-set', async function (assert) {
    await visit(urls.hostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, 'random string');
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(instances.hostSet.name, 'random string');
    assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.hostSet.name);
  });

  test('saving an existing host set with invalid fields displays error messages', async function (assert) {
    this.server.patch('/host-sets/:id', () => {
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
    await visit(urls.hostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, 'random string');
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });

  test('can discard unsaved host set changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const mockName = 'random string';
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostSet.name, mockName);
    await visit(urls.hostSet);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, mockName);

    assert.strictEqual(currentURL(), urls.hostSet);
    try {
      await visit(urls.hostSets);
    } catch (e) {
      assert.ok(find(commonSelectors.MODAL_WARNING));
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);
      assert.strictEqual(currentURL(), urls.hostSets);
      assert.notEqual(this.server.schema.hostSets.first().name, mockName);
    }
  });
});
