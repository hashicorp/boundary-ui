/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | groups | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const MANAGE_DROPDOWN_SELECTOR = "[data-test-manage-group-dropdown] div:first-child button"
  const DELETE_ACTION_SELECTOR = "[data-test-manage-group-dropdown] ul li button"

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

  test('can delete a group', async function (assert) {
    const groupsCount = this.server.db.groups.length;
    await visit(urls.group);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(this.server.db.groups.length, groupsCount - 1);
  });

  test('cannot delete a group without proper authorization', async function (assert) {
    instances.group.authorized_actions =
      instances.group.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.group);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger'),
    );
  });

  test('errors are displayed when delete project fails', async function (assert) {
    this.server.del('/groups/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });
    await visit(urls.group);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'Oops.',
      'Displays primary error message.',
    );
  });
});
