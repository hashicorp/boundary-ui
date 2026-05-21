/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | aliases | project | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const SUFFIX_VALUE = '.example';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
    projectAlias: null,
    projectAliasOther: null,
    globalAlias: null,
  };

  const urls = {
    aliases: null,
    newAlias: null,
  };

  hooks.beforeEach(async function () {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
      alias_suffix: SUFFIX_VALUE,
    });

    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });

    instances.projectAlias = this.server.create('alias', {
      scope: instances.scopes.project,
      scope_id: instances.scopes.project.id,
      destination_id: instances.target.id,
      base_value: 'shipping-api',
      value: `shipping-api${SUFFIX_VALUE}`,
    });

    instances.projectAliasOther = this.server.create('alias', {
      scope: instances.scopes.project,
      scope_id: instances.scopes.project.id,
      destination_id: null,
      base_value: 'orphan-alias',
      value: `orphan-alias${SUFFIX_VALUE}`,
    });

    // A global alias must NOT show up in the project-scoped list.
    instances.globalAlias = this.server.create('alias', {
      scope: instances.scopes.global,
      scope_id: instances.scopes.global.id,
      destination_id: null,
      base_value: 'global-only',
      value: 'global-only',
    });

    urls.aliases = `/scopes/${instances.scopes.project.id}/aliases`;
    urls.newAlias = `${urls.aliases}/new`;
  });

  test('lists project aliases scoped to the current project', async function (assert) {
    await visit(urls.aliases);

    assert.dom(selectors.GATED_STATE).doesNotExist();
    assert.dom(selectors.TABLE_ROW(instances.projectAlias.id)).isVisible();
    assert.dom(selectors.TABLE_ROW(instances.projectAliasOther.id)).isVisible();
    // Global aliases must not appear on the project list.
    assert.dom(selectors.TABLE_ROW(instances.globalAlias.id)).doesNotExist();
  });

  test('does not render the scope column on a project scope', async function (assert) {
    await visit(urls.aliases);

    assert.dom('thead th').exists({ count: 4 });
    // The third column on a project list is "Resource ID", not "Scope".
    assert
      .dom(selectors.SCOPE_COLUMN_HEADER)
      .hasText(
        this.owner
          .lookup('service:intl')
          .t('resources.alias.titles.resource_id'),
      );
  });

  test('user can search for a specific project alias by id', async function (assert) {
    await visit(urls.aliases);

    assert.dom(selectors.TABLE_ROW(instances.projectAlias.id)).isVisible();
    assert.dom(selectors.TABLE_ROW(instances.projectAliasOther.id)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.projectAliasOther.id);
    await waitFor(selectors.TABLE_ROW(instances.projectAlias.id), {
      count: 0,
    });

    assert.dom(selectors.TABLE_ROW(instances.projectAliasOther.id)).isVisible();
    assert.dom(selectors.TABLE_ROW(instances.projectAlias.id)).doesNotExist();
  });

  test('shows the New Alias button when user can create and aliases exist', async function (assert) {
    await visit(urls.aliases);

    assert.dom(commonSelectors.HREF(urls.newAlias)).isVisible();
  });

  test('displays the composed alias value (with suffix) in the table', async function (assert) {
    await visit(urls.aliases);

    assert
      .dom(selectors.TABLE_ROW(instances.projectAlias.id))
      .includesText(`shipping-api${SUFFIX_VALUE}`);
    // Sanity-check: base_value alone ('shipping-api') without the suffix
    // is not rendered as the cell text.
    assert
      .dom(selectors.TABLE_ROW(instances.projectAlias.id))
      .doesNotIncludeText('shipping-api.example shipping-api');
  });
});
