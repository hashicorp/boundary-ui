/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | aliases | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let aliasCount;

  const DROPDOWN_BUTTON_SELECTOR = '.hds-dropdown-toggle-icon';
  const DROPDOWN_ITEM_SELECTOR = '.hds-dropdown-list-item button';
  const MODAL_SELECTOR = '.alias-deletion-modal';
  const DELETE_BUTTON_SELECTOR = '.hds-modal__footer .hds-button:nth-child(1)';
  const CLEAR_BUTTON_SELECTOR = '.hds-modal__footer .hds-button:nth-child(2)';

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
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
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

    aliasCount = () => this.server.schema.aliases.all().models.length;
  });

  test('users can delete an alias', async function (assert) {
    const count = aliasCount();

    assert.true(instances.alias.authorized_actions.includes('delete'));
    await visit(urls.globalScope);
    urls.alias = `${urls.aliases}/${instances.alias.id}`;

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Delete');
    await click(DROPDOWN_ITEM_SELECTOR);
    assert.dom(MODAL_SELECTOR);
    await click(DELETE_BUTTON_SELECTOR);
    assert.strictEqual(aliasCount(), count - 1);
  });

  test('users cannot delete an alias without proper authorization', async function (assert) {
    instances.alias.authorized_actions =
      instances.alias.authorized_actions.filter((item) => item !== 'delete');

    await visit(urls.globalScope);

    urls.alias = `${urls.aliases}/${instances.alias.id}`;

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).isNotVisible();
  });

  test('users have the option to clear an alias instead of deleting it', async function (assert) {
    const count = aliasCount();
    assert.true(instances.alias.authorized_actions.includes('delete'));

    await visit(urls.globalScope);

    urls.alias = `${urls.aliases}/${instances.alias.id}`;

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(DROPDOWN_ITEM_SELECTOR).exists();
    assert.dom(DROPDOWN_ITEM_SELECTOR).hasText('Delete');
    await click(DROPDOWN_ITEM_SELECTOR);
    assert.dom(MODAL_SELECTOR);
    await click(CLEAR_BUTTON_SELECTOR);
    //  await click(`[href="${urls.aliases}"]`);
    assert.strictEqual(aliasCount(), count);
  });
});
