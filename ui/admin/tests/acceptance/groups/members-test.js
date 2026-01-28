/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | groups | members', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
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

  hooks.beforeEach(async function () {
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.members);

    assert.strictEqual(currentURL(), urls.members);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount });
  });

  test('can remove a member', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.members);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount });

    await click(selectors.TABLE_MEMBER_ACTION_DROPDOWN);
    await click(selectors.TABLE_MEMBER_ACTION_DROPDOWN_DELETE_MEMBER);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount - 1 });
  });

  test('cannot remove a member without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.group.authorized_actions.filter(
      (item) => item !== 'remove-members',
    );
    instances.group.update({ authorized_actions });
    await visit(urls.members);

    assert
      .dom(selectors.TABLE_MEMBER_ACTION_DROPDOWN_DELETE_MEMBER)
      .doesNotExist();
  });

  test('shows error message on member remove', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const errorMsg = 'The request was invalid.';
    this.server.post('/groups/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
          details: {},
        },
      );
    });
    await visit(urls.members);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount });

    await click(selectors.TABLE_MEMBER_ACTION_DROPDOWN);
    await click(selectors.TABLE_MEMBER_ACTION_DROPDOWN_DELETE_MEMBER);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });

  test('visiting member selection', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.addMembers);

    assert.strictEqual(currentURL(), urls.addMembers);
  });

  test('can navigate to add members with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.group);
    await click(selectors.MANAGE_DROPDOWN);
    assert.dom(selectors.MANAGE_DROPDOWN_ADD_MEMBER).isVisible();
  });

  test('cannot navigate to add members without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.group.authorized_actions.filter(
      (item) => item !== 'add-members',
    );
    instances.group.update({ authorized_actions });

    await visit(urls.group);
    await click(selectors.MANAGE_DROPDOWN);

    assert.dom(commonSelectors.HREF(urls.addMembers)).doesNotExist();
  });

  test('select and save members to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.group.update({ memberIds: [] });
    await visit(urls.members);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_MEMBER);

    assert.strictEqual(currentURL(), urls.addMembers);
    // Click three times to select, unselect, then reselect (for coverage)
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    await visit(urls.members);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('select and cancel members to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.members);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount });

    await click(selectors.TABLE_MEMBER_ACTION_DROPDOWN);
    await click(selectors.TABLE_MEMBER_ACTION_DROPDOWN_DELETE_MEMBER);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount - 1 });

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_MEMBER);

    assert.strictEqual(currentURL(), urls.addMembers);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.members);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: membersCount - 1 });
  });

  test('shows error message on member add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const errorMsg = 'The request was invalid.';
    this.server.post('/groups/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
          details: {},
        },
      );
    });
    instances.group.update({ memberIds: [] });
    await visit(urls.addMembers);

    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });
});
