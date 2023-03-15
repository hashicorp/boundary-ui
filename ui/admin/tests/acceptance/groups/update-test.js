/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | groups | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    group: null,
  };
  const urls = {
    orgScope: null,
    groups: null,
    group: null,
    newGroup: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create('group', {
      scope: instances.scopes.org,
    });
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.newGroup = `${urls.groups}/new`;
  });

  test('can save changes to an existing group', async function (assert) {
    assert.expect(2);
    await visit(urls.group);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated admin group');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.group);
    assert.strictEqual(this.server.db.groups[0].name, 'Updated admin group');
  });

  test('cannot make changes to an existing group without proper authorization', async function (assert) {
    assert.expect(1);
    instances.group.authorized_actions =
      instances.group.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.group);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to an existing group', async function (assert) {
    assert.expect(1);
    await visit(urls.group);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated admin group');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Updated admin group');
  });

  test('saving an existing group with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/groups/:id', () => {
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
    await visit(urls.group);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.strictEqual(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
