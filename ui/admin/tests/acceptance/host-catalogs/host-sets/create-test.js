/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | host sets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR =
    '[name="preferred_endpoints"] input';
  const PREFERRED_ENDPOINT_BUTTON_SELECTOR =
    '[name="preferred_endpoints"] button';
  const FILTER_TEXT_INPUT_SELECTOR = '[name="filters"] input';
  const FILTER_BUTTON_SELECTOR = '[name="filters"] button';
  const AZURE_FILTER_SELECTOR = '[name="filter"]';
  const SYNC_INTERVAL_SELECTOR = '[name="sync_interval_seconds"]';
  const SUBMIT_BTN_SELECTOR = '.rose-form-actions [type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_SELECTOR = '[name="name"]';

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

  hooks.beforeEach(function () {
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
    // Generate resource couner
    getHostSetCount = () => this.server.schema.hostSets.all().models.length;
    authenticateSession({});
  });

  test('can create new host sets', async function (assert) {
    const count = getHostSetCount();
    await visit(urls.newHostSet);
    await fillIn(NAME_SELECTOR, 'random string');
    await click(SUBMIT_BTN_SELECTOR);
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
    await fillIn(NAME_SELECTOR, name);
    await fillIn(PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR, 'endpoint');
    await click(PREFERRED_ENDPOINT_BUTTON_SELECTOR);
    await fillIn(FILTER_TEXT_INPUT_SELECTOR, 'filter_test');
    await click(FILTER_BUTTON_SELECTOR);

    await fillIn(SYNC_INTERVAL_SELECTOR, 10);
    await click(SUBMIT_BTN_SELECTOR);

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
    await fillIn(NAME_SELECTOR, name);
    await fillIn(PREFERRED_ENDPOINT_TEXT_INPUT_SELECTOR, 'endpoint');
    await click(PREFERRED_ENDPOINT_BUTTON_SELECTOR);
    await fillIn(AZURE_FILTER_SELECTOR, 'filter');
    await fillIn(SYNC_INTERVAL_SELECTOR, 10);
    await click(SUBMIT_BTN_SELECTOR);

    assert.strictEqual(getHostSetCount(), count + 1);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.deepEqual(hostSet.preferredEndpoints, ['endpoint']);
    assert.deepEqual(hostSet.attributes.filter, 'filter');
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('Users cannot create a new host set without proper authorization', async function (assert) {
    instances.hostCatalog.authorized_collection_actions['host-sets'] = [];
    await visit(urls.hostCatalog);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'create',
      ),
    );
    assert.notOk(find(`.rose-layout-page-actions [href="${urls.newHostSet}"]`));
  });

  test('Users cannot navigate to new host sets route without proper authorization', async function (assert) {
    instances.hostCatalog.authorized_collection_actions['host-sets'] = [];
    await visit(urls.hostSets);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions['host-sets'].includes(
        'create',
      ),
    );
    assert.notOk(find(`[href="${urls.newHostSet}"]`));
  });

  test('can cancel create new host', async function (assert) {
    const count = getHostSetCount();
    await visit(urls.newHostSet);
    await fillIn(NAME_SELECTOR, 'random string');
    await click(CANCEL_BTN_SELECTOR);
    assert.strictEqual(currentURL(), urls.hostSets);
    assert.strictEqual(getHostSetCount(), count);
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
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
    assert.ok(
      find('[data-test-error-message-name]').textContent.trim(),
      'Name is required.',
    );
  });

  test('users cannot directly navigate to new host set route without proper authorization', async function (assert) {
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
