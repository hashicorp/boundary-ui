/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | users | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupSqlite(hooks);

  let confirmService;

  const urls = {
    orgScope: null,
    users: null,
    user: null,
  };

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.user = this.server.create('user', {
      scope: instances.scopes.org,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.users = `${urls.orgScope}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;
    confirmService = this.owner.lookup('service:confirm');

    await authenticateSession({});
  });

  test('can save changes to an existing user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.user);
    assert.strictEqual(
      this.server.schema.users.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot make changes to an existing user without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));

    assert.false(instances.user.authorized_actions.includes('update'));
    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can cancel changes to an existing user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(instances.user.name, commonSelectors.FIELD_NAME_VALUE);
    assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.user.name);
  });

  test('saving an existing user with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const errorMessage =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    await visit(urls.users);
    this.server.patch('/users/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
        },
      );
    });

    await click(commonSelectors.HREF(urls.user));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
  });

  test('can discard unsaved user changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    confirmService.enabled = true;
    assert.notEqual(instances.user.name, commonSelectors.FIELD_NAME_VALUE);
    await visit(urls.user);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.user);

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.MODAL_WARNING).exists();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

    assert.strictEqual(currentURL(), urls.users);
    assert.notEqual(
      this.server.schema.users.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can click cancel on discard dialog box for unsaved user changes', async function (assert) {
    confirmService.enabled = true;
    assert.notEqual(instances.user.name, commonSelectors.FIELD_NAME_VALUE);
    await visit(urls.user);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.user);

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.MODAL_WARNING).exists();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

    assert.strictEqual(currentURL(), urls.user);
    assert.notEqual(
      this.server.schema.users.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });
});
