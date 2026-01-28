/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | aliases | update', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let aliasCount;

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

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
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
    urls.alias = `${urls.aliases}/${instances.alias.id}`;
    aliasCount = () => this.server.schema.aliases.all().models.length;
  });

  test('users can update an existing alias', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.aliases);
    await click(commonSelectors.HREF(urls.alias));
    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(instances.alias.name, commonSelectors.FIELD_NAME_VALUE);
  });

  test('can cancel changes to an existing alias', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const name = instances.alias.name;
    await visit(urls.aliases);

    await click(commonSelectors.HREF(urls.alias));

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    await click(commonSelectors.CANCEL_BTN);

    assert.dom(commonSelectors.FIELD_NAME).hasValue(name);
    assert.strictEqual(instances.alias.name, name);
  });

  test('users have the option to clear an alias', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = aliasCount();
    assert.true(instances.alias.authorized_actions.includes('update'));
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.aliases));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert
      .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN)
      .hasText('Clear');

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);
    assert.strictEqual(aliasCount(), count);
  });

  test('users can not see the option to clear an alias without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.alias.authorized_actions =
      instances.alias.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.globalScope);

    assert.false(instances.alias.authorized_actions.includes('update'));

    await click(commonSelectors.HREF(urls.aliases));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).exists();

    assert
      .dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN)
      .doesNotIncludeText('Clear');
  });
});
