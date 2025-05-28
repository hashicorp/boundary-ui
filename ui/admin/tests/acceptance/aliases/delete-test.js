/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | aliases | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let aliasCount;

  const DROPDOWN_BUTTON_SELECTOR =
    'tbody tr td:last-child .hds-dropdown-toggle-icon';

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
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
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

  test('users can delete an alias with proper authorization', async function (assert) {
    const count = aliasCount();

    assert.true(instances.alias.authorized_actions.includes('delete'));
    await visit(urls.aliases);
    await click(DROPDOWN_BUTTON_SELECTOR);
    await click(commonSelectors.DELETE_BTN);

    assert.strictEqual(aliasCount(), count - 1);
  });

  test('users cannot delete an alias without proper authorization', async function (assert) {
    instances.alias.authorized_actions =
      instances.alias.authorized_actions.filter((item) => item !== 'delete');

    await visit(urls.globalScope);

    urls.alias = `${urls.aliases}/${instances.alias.id}`;

    await click(`[href="${urls.aliases}"]`);
    await click(DROPDOWN_BUTTON_SELECTOR);

    assert.dom(commonSelectors.DELETE_BTN).doesNotExist();
  });
});
