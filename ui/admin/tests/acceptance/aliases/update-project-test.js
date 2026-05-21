/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | aliases | project | update', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const SUFFIX_VALUE = '.example';
  const SEED_BASE_VALUE = 'foo';
  const NEW_BASE_VALUE = 'bar';
  const VALUE_INPUT = '[name=value]';
  const SUFFIX_DECORATION = '[data-test-alias-suffix-decoration]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
    alias: null,
  };

  const urls = {
    aliases: null,
    alias: null,
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
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.project,
      scope_id: instances.scopes.project.id,
      destination_id: instances.target.id,
      base_value: SEED_BASE_VALUE,
      value: `${SEED_BASE_VALUE}${SUFFIX_VALUE}`,
    });

    urls.aliases = `/scopes/${instances.scopes.project.id}/aliases`;
    urls.alias = `${urls.aliases}/${instances.alias.id}`;
  });

  test('the edit input pre-populates with base_value and the suffix decoration is rendered', async function (assert) {
    await visit(urls.alias);

    assert.dom(VALUE_INPUT).hasValue(SEED_BASE_VALUE);
    assert.dom(SUFFIX_DECORATION).hasText(SUFFIX_VALUE);
  });

  test('updating a project alias submits the user input and the server composes the suffixed value', async function (assert) {
    await visit(urls.alias);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(VALUE_INPUT, NEW_BASE_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(instances.alias.base_value, NEW_BASE_VALUE);
    assert.strictEqual(
      instances.alias.value,
      `${NEW_BASE_VALUE}${SUFFIX_VALUE}`,
    );
  });

  test('cancelling an edit leaves the composed value unchanged', async function (assert) {
    const originalBaseValue = instances.alias.base_value;
    const originalValue = instances.alias.value;

    await visit(urls.alias);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(VALUE_INPUT, NEW_BASE_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(instances.alias.base_value, originalBaseValue);
    assert.strictEqual(instances.alias.value, originalValue);
  });
});
