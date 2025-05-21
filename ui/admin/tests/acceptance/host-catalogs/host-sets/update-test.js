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
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | host sets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR =
    '[name="preferred_endpoints"] input';
  const PREFERRED_ENDPOINT_BUTTON_SELECTOR =
    '[name="preferred_endpoints"] button';
  const PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR =
    '[name="preferred_endpoints"] [data-test-remove-button]';
  const FILTER_TEXT_INPUT_SELECTOR = '[name="filters"] input';
  const FILTER_BUTTON_SELECTOR = '[name="filters"] button';
  const FILTER_REMOVE_BUTTON_SELECTOR =
    '[name="filters"] [data-test-remove-button]';
  const SYNC_INTERVAL_SELECTOR = '[name="sync_interval_seconds"]';
  const SUBMIT_BTN_SELECTOR = '.rose-form-actions [type="submit"]';
  const AZURE_FILTER_SELECTOR = '[name="filter"]';
  const EDIT_BUTTON_SELECTOR = 'form .rose-form-actions [type="button"]';
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
    this.server.post('/host-sets', () => {
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
    await visit(urls.newHostSet);
    await click(SUBMIT_BTN_SELECTOR);
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.ok(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
    );
  });

  test('can save changes to existing host-set', async function (assert) {
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click(SUBMIT_BTN_SELECTOR);
    assert.strictEqual(currentURL(), urls.hostSet);
    assert.strictEqual(
      this.server.schema.hostSets.first().name,
      'random string',
    );
  });

  test('can save changes to an existing aws host-set', async function (assert) {
    await visit(urls.awshostSet);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');

    const name = 'aws host set';
    await fillIn('[name="name"]', name);

    const endpointList = findAll(PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR);

    for (const element of endpointList) {
      await click(element);
    }

    assert.strictEqual(
      findAll(PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR).length,
      0,
    );

    await fillIn(PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR, 'sample endpoint');
    await click(PREFERRED_ENDPOINT_BUTTON_SELECTOR);

    // Remove all the filters
    const filterList = await Promise.all(
      findAll(FILTER_REMOVE_BUTTON_SELECTOR),
    );
    for (const element of filterList) {
      await click(element);
    }

    assert.strictEqual(findAll(FILTER_REMOVE_BUTTON_SELECTOR).length, 0);
    await fillIn(FILTER_TEXT_INPUT_SELECTOR, 'sample filters');
    await click(FILTER_BUTTON_SELECTOR);

    await fillIn(SYNC_INTERVAL_SELECTOR, 10);

    await click(SUBMIT_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.awshostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.strictEqual(hostSet.name, name);
    assert.deepEqual(hostSet.preferredEndpoints, ['sample endpoint']);
    assert.deepEqual(hostSet.attributes.filters, ['sample filters']);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can save changes to an existing azure host-set', async function (assert) {
    await visit(urls.azureHostSet);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');

    const name = 'azure host set';
    await fillIn('[name="name"]', name);
    // Remove all the preferred endpoints

    const endpointList = findAll(PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR);

    for (const element of endpointList) {
      await click(element);
    }

    assert.strictEqual(
      findAll(PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR).length,
      0,
    );
    await fillIn(PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR, 'sample endpoints');
    await click(PREFERRED_ENDPOINT_BUTTON_SELECTOR);

    await fillIn(AZURE_FILTER_SELECTOR, 'filter');
    await fillIn(SYNC_INTERVAL_SELECTOR, 10);
    await click(SUBMIT_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.azureHostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.strictEqual(hostSet.name, name);
    assert.deepEqual(hostSet.preferredEndpoints, ['sample endpoints']);
    assert.deepEqual(hostSet.attributes.filter, 'filter');
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can save changes to an existing gcp host-set', async function (assert) {
    await visit(urls.awshostSet);

    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');

    const name = 'gcp host set';
    await fillIn('[name="name"]', name);

    const endpointList = findAll(PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR);

    for (const element of endpointList) {
      await click(element);
    }

    assert.strictEqual(
      findAll(PREFERRED_ENDPOINT_REMOVE_BUTTON_SELECTOR).length,
      0,
    );

    await fillIn(PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR, 'sample endpoint');
    await click(PREFERRED_ENDPOINT_BUTTON_SELECTOR);

    // Remove all the filters
    const filterList = await Promise.all(
      findAll(FILTER_REMOVE_BUTTON_SELECTOR),
    );
    for (const element of filterList) {
      await click(element);
    }

    assert.strictEqual(findAll(FILTER_REMOVE_BUTTON_SELECTOR).length, 0);
    await fillIn(FILTER_TEXT_INPUT_SELECTOR, 'sample filters');
    await click(FILTER_BUTTON_SELECTOR);

    await fillIn(SYNC_INTERVAL_SELECTOR, 10);

    await click(SUBMIT_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.awshostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.strictEqual(hostSet.name, name);
    assert.deepEqual(hostSet.preferredEndpoints, ['sample endpoint']);
    assert.deepEqual(hostSet.attributes.filters, ['sample filters']);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('cannot make changes to an existing host without proper authorization', async function (assert) {
    instances.hostSet.authorized_actions =
      instances.hostSet.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.hostSet);
    assert.notOk(find('.rose-layout-page-actions .hds-button-secondary'));
  });

  test('can cancel changes to existing host-set', async function (assert) {
    await visit(urls.hostSet);
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.hostSet.name, 'random string');
    assert.strictEqual(find('[name="name"]').value, instances.hostSet.name);
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
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click(SUBMIT_BTN_SELECTOR);
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.ok(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
    );
  });

  test('can discard unsaved host set changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click(EDIT_BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.hostSet);
    try {
      await visit(urls.hostSets);
    } catch (e) {
      assert.ok(find(commonSelectors.MODAL_WARNING));
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);
      assert.strictEqual(currentURL(), urls.hostSets);
      assert.notEqual(
        this.server.schema.hostSets.first().name,
        'random string',
      );
    }
  });
});
