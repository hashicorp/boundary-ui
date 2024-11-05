/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | groups | members', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

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
    members: null,
    addMembers: null,
  };
  let membersCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-group-dropdown] button:first-child';
  const ADD_MEMBERS_ACTION_SELECTOR =
    '[data-test-manage-group-dropdown] ul li a';

  hooks.beforeEach(function () {
    authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create(
      'group',
      {
        scope: instances.scopes.org,
      },
      'withMembers',
    );
    membersCount = instances.group.memberIds.length;
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.members = `${urls.group}/members`;
    urls.addMembers = `${urls.group}/add-members`;
  });

  test('visiting group members', async function (assert) {
    await visit(urls.members);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.members);
    assert.strictEqual(findAll('tbody tr').length, membersCount);
  });

  test('can remove a member', async function (assert) {
    await visit(urls.members);
    assert.strictEqual(findAll('tbody tr').length, membersCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.strictEqual(findAll('tbody tr').length, membersCount - 1);
  });

  test('cannot remove a member without proper authorization', async function (assert) {
    const authorized_actions = instances.group.authorized_actions.filter(
      (item) => item !== 'remove-members',
    );
    instances.group.update({ authorized_actions });
    await visit(urls.members);
    assert.notOk(find('tbody tr .rose-dropdown-button-danger'));
  });

  test('shows error message on member remove', async function (assert) {
    this.server.post('/groups/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.members);
    assert.strictEqual(findAll('tbody tr').length, membersCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.ok(find('[role="alert"]'));
  });

  test('visiting member selection', async function (assert) {
    await visit(urls.addMembers);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.addMembers);
  });

  test('can navigate to add members with proper authorization', async function (assert) {
    await visit(urls.group);
    await click(MANAGE_DROPDOWN_SELECTOR);
    assert.dom(ADD_MEMBERS_ACTION_SELECTOR).isVisible();
  });

  test('cannot navigate to add members without proper authorization', async function (assert) {
    const authorized_actions = instances.group.authorized_actions.filter(
      (item) => item !== 'add-members',
    );
    instances.group.update({ authorized_actions });
    await visit(urls.group);
    assert.notOk(find(`[href="${urls.addMembers}"]`));
  });

  test('select and save members to add', async function (assert) {
    instances.group.update({ memberIds: [] });
    await visit(urls.members);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_MEMBERS_ACTION_SELECTOR);
    assert.strictEqual(currentURL(), urls.addMembers);
    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.members);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('select and cancel members to add', async function (assert) {
    await visit(urls.members);
    assert.strictEqual(findAll('tbody tr').length, membersCount);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.strictEqual(findAll('tbody tr').length, membersCount - 1);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_MEMBERS_ACTION_SELECTOR);
    assert.strictEqual(currentURL(), urls.addMembers);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.members);
    assert.strictEqual(findAll('tbody tr').length, membersCount - 1);
  });

  test('shows error message on member add', async function (assert) {
    this.server.post('/groups/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    instances.group.update({ memberIds: [] });
    await visit(urls.addMembers);
    await click('tbody label');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });
});
