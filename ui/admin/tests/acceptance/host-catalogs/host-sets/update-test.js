/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | host sets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    authenticateSession({});
  });

  test('saving a new host set with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
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
        }
      );
    });
    await visit(urls.newHostSet);
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can save changes to existing host-set', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.hostSet);
    assert.strictEqual(
      this.server.schema.hostSets.first().name,
      'random string'
    );
  });

  test('can save changes to an existing aws host-set', async function (assert) {
    assert.expect(7);

    await visit(urls.awshostSet);

    await click(
      'form .rose-form-actions [type="button"]',
      'Activate edit mode'
    );

    const name = 'aws host set';
    await fillIn('[name="name"]', name);

    await Promise.all(
      findAll('[name="preferred_endpoints"] [data-test="remove-button"]').map(
        (element) => click(element)
      )
    );
    assert.strictEqual(
      findAll('[name="preferred_endpoints"] [data-test="remove-button"]')
        .length,
      0
    );

    await fillIn('[name="preferred_endpoints"] input', 'sample endpoint');
    await click('[name="preferred_endpoints"] button');

    // Remove all the filters
    await Promise.all(
      findAll('[name="filters"] [data-test="remove-button"]').map((element) =>
        click(element)
      )
    );

    assert.strictEqual(
      findAll('[name="filters"] [data-test="remove-button"]').length,
      0
    );
    await fillIn('[name="filters"] input', 'sample filters');
    await click('[name="filters"] button');

    await fillIn('[name="sync_interval_seconds"]', 10);

    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.awshostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.strictEqual(hostSet.name, name);
    assert.deepEqual(hostSet.preferredEndpoints, ['sample endpoint']);
    assert.deepEqual(hostSet.attributes.filters, ['sample filters']);
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('can save changes to an existing azure host-set', async function (assert) {
    assert.expect(6);

    await visit(urls.azureHostSet);

    await click(
      'form .rose-form-actions [type="button"]',
      'Activate edit mode'
    );

    const name = 'azure host set';
    await fillIn('[name="name"]', name);
    // Remove all the preferred endpoints
    await Promise.all(
      findAll('[name="preferred_endpoints"] [data-test="remove-button"]').map(
        (element) => click(element)
      )
    );
    assert.strictEqual(
      findAll('[name="preferred_endpoints"] [data-test="remove-button"]')
        .length,
      0
    );
    await fillIn('[name="preferred_endpoints"] input', 'sample endpoints');
    await click('[name="preferred_endpoints"] button');

    await fillIn('[name="filter"]', 'filter');
    await fillIn('[name="sync_interval_seconds"]', 10);
    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.azureHostSet);
    const hostSet = this.server.schema.hostSets.findBy({ name });
    assert.strictEqual(hostSet.name, name);
    assert.deepEqual(hostSet.preferredEndpoints, ['sample endpoints']);
    assert.deepEqual(hostSet.attributes.filter, 'filter');
    assert.deepEqual(hostSet.syncIntervalSeconds, 10);
  });

  test('cannot make changes to an existing host without proper authorization', async function (assert) {
    assert.expect(1);
    instances.hostSet.authorized_actions =
      instances.hostSet.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.hostSet);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to existing host-set', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.hostSet.name, 'random string');
    assert.strictEqual(find('[name="name"]').value, instances.hostSet.name);
  });

  test('saving an existing host set with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
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
        }
      );
    });
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved host set changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.hostSet);
    try {
      await visit(urls.hostSets);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.strictEqual(currentURL(), urls.hostSets);
      assert.notEqual(
        this.server.schema.hostSets.first().name,
        'random string'
      );
    }
  });
});
