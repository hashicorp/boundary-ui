/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';

import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | aliases | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let aliasCount;

  const SAVE_BTN_SELECTOR = '.rose-form-actions [type="submit"]';

  const NAME_FIELD_SELECTOR = '[name="name"]';

  const NAME_FIELD_TEXT = 'random string';

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const CLEAR_DROPDOWN_SELECTOR =
    '.hds-dropdown-list-item--color-action:nth-child(2)';

  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    alias: null,
    target: null,
  };

  const urls = {
    globalScope: null,
    aliases: null,
    alias: null,
    target: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
      destination_id: instances.target.id,
    });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;
    urls.alias = `${urls.aliases}/${instances.alias.id}`;
    aliasCount = () => this.server.schema.aliases.all().models.length;

    authenticateSession({});
  });

  test('users can update an exisiting alias', async function (assert) {
    await visit(urls.aliases);
    await click(`[href="${urls.alias}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(instances.alias.name, NAME_FIELD_TEXT);
  });

  test('can cancel changes to an existing alias', async function (assert) {
    const name = instances.alias.name;
    await visit(urls.aliases);

    await click(`[href="${urls.aliases}"]`);
    await click(`[href="${urls.alias}"]`);

    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);

    await click(BUTTON_SELECTOR, 'Click cancel');

    assert.dom(NAME_FIELD_SELECTOR).hasValue(`${name}`);
    assert.strictEqual(instances.alias.name, name);
  });

  test('users have the option to clear an alias', async function (assert) {
    const count = aliasCount();
    assert.true(instances.alias.authorized_actions.includes('update'));
    await visit(urls.globalScope);

    urls.alias = `${urls.aliases}/${instances.alias.id}`;

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(CLEAR_DROPDOWN_SELECTOR).exists();
    await click(CLEAR_DROPDOWN_SELECTOR);
    assert.strictEqual(aliasCount(), count);
  });

  test('users can not see the option to clear an alias without proper authorization', async function (assert) {
    instances.alias.authorized_actions =
      instances.alias.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.globalScope);

    assert.false(instances.alias.authorized_actions.includes('update'));

    urls.alias = `${urls.aliases}/${instances.alias.id}`;
    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);
    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(CLEAR_DROPDOWN_SELECTOR).doesNotExist();
  });
});
