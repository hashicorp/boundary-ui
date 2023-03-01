/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
  };

  hooks.beforeEach(function () {
    //Generate the resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    // Generate route URLs for resources
    urls.globalScope = '/scopes/global';
    urls.workers = `${urls.globalScope}/workers`;
    (urls.worker = `${urls.workers}/${instances.worker.id}`),
      authenticateSession({});
  });

  test('can save changes to an existing worker', async function (assert) {
    assert.expect(2);
    await visit(urls.worker);
    await click('form [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Updated worker name');
    await click('.rose-form-actions [type="submit"]');
    assert.dom(`[href="${urls.worker}"]`).isVisible();
    await assert.dom('input[name="name"]').hasValue('Updated worker name');
  });

  test('can cancel changes to an existing worker', async function (assert) {
    assert.expect(1);
    const name = instances.worker.name;
    await visit(urls.worker);
    await click('form [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', `Updated Worker Name`);
    await click('.rose-form-actions [type="button"]');
    await assert.dom('input[name="name"]').hasValue(`${name}`);
  });

  test('saving an existing worker with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/workers/:id', () => {
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
                description: 'Name is required',
              },
            ],
          },
        }
      );
    });
    await visit(urls.worker);
    await click('.rose-form-actions [type="button"]', 'Click edit mode');
    await fillIn('[name="name"]', 'Worker Name');
    await click('[type="submit"]');
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.strictEqual(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required',
      'Displays field-level errors.'
    );
  });
});
