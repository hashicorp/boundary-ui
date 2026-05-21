/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | aliases | delete', function (hooks) {
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

    aliasCount = () => this.server.schema.aliases.all().models.length;
  });

  test('users can delete an alias with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = aliasCount();

    assert.true(instances.alias.authorized_actions.includes('delete'));
    await visit(urls.aliases);

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.DELETE_BTN);

    assert.strictEqual(aliasCount(), count - 1);
  });

  test('users cannot delete an alias without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.alias.authorized_actions =
      instances.alias.authorized_actions.filter((item) => item !== 'delete');

    await visit(urls.globalScope);

    urls.alias = `${urls.aliases}/${instances.alias.id}`;
    await click(commonSelectors.HREF(urls.aliases));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert.dom(commonSelectors.DELETE_BTN).doesNotExist();
  });

  test('users can delete a project-scoped alias from the project aliases list', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    // Give the project a suffix so the aliases list page renders (not gated).
    instances.scopes.project.update({ alias_suffix: '.example' });

    const projectAlias = this.server.create('alias', {
      scope: instances.scopes.project,
      scope_id: instances.scopes.project.id,
      destination_id: instances.target.id,
      base_value: 'shipping-api',
      value: 'shipping-api.example',
    });

    const projectAliasesUrl = `/scopes/${instances.scopes.project.id}/aliases`;
    const count = aliasCount();

    assert.true(projectAlias.authorized_actions.includes('delete'));
    await visit(projectAliasesUrl);

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.DELETE_BTN);

    assert.strictEqual(aliasCount(), count - 1);
    assert.notOk(this.server.schema.aliases.find(projectAlias.id));
  });
});
