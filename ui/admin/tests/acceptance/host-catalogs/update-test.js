/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
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
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    authenticateSession({});
  });

  test('can save changes to existing host catalog', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.hostCatalog);
    assert.strictEqual(
      this.server.schema.hostCatalogs.all().models[0].name,
      'random string'
    );
  });

  test('cannot make changes to an existing host catalog without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.hostCatalogs);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'update'
      );

    await click(`[href="${urls.hostCatalog}"]`);

    assert.dom('form [type="button"]').doesNotExist();
  });

  test('clicking cancel in edit mode does not save changes', async function (assert) {
    assert.expect(2);
    await visit(urls.hostCatalog);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]', 'Click Cancel');

    assert.notEqual(instances.hostCatalog.name, 'random string');
    assert.dom('[name="name"]').hasValue(instances.hostCatalog.name);
  });

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
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
        }
      );
    });

    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.rose-form-error-message').hasText('Name is required.');
  });

  test('can discard unsaved host catalog changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.hostCatalog);
    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:first-child', 'Click Discard');

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.notEqual(
      this.server.schema.hostCatalogs.first().name,
      'random string'
    );
  });

  test('can click cancel on discard dialog box for unsaved host catalog changes', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.hostCatalog);
    await click(`[href="${urls.hostCatalogs}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:last-child', 'Click Cancel');

    assert.strictEqual(currentURL(), urls.hostCatalog);
    assert.notEqual(
      this.server.schema.hostCatalogs.all().models[0].name,
      'random string'
    );
  });
});
