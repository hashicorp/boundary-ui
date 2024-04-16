/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | aliases | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const SAVE_BTN_SELECTOR = '.rose-form-actions [type="submit"]';

  const NAME_FIELD_SELECTOR = '[name="name"]';

  const NAME_FIELD_TEXT = 'random string';

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    alias: null,
  };

  const urls = {
    globalScope: null,
    aliases: null,
    alias: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });

    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.aliases = `${urls.globalScope}/aliases`;
    urls.alias = `${urls.aliases}/${instances.alias.id}`;

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
});
