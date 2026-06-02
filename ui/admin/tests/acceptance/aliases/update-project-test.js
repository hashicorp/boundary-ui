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

  const ORG_SUFFIX_VALUE = '.boundary';
  const SUFFIX_VALUE = '.example';
  const COMBINED_SUFFIX_VALUE = `${SUFFIX_VALUE}${ORG_SUFFIX_VALUE}`;
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
      alias_suffix: ORG_SUFFIX_VALUE,
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
      value: `${SEED_BASE_VALUE}${COMBINED_SUFFIX_VALUE}`,
    });

    urls.aliases = `/scopes/${instances.scopes.project.id}/aliases`;
    urls.alias = `${urls.aliases}/${instances.alias.id}`;
  });

  test('the edit input pre-populates with unsuffixed value and renders the suffix decoration', async function (assert) {
    await visit(urls.alias);

    // View mode: full composed value is shown, no suffix decoration.
    assert
      .dom(VALUE_INPUT)
      .hasValue(`${SEED_BASE_VALUE}${COMBINED_SUFFIX_VALUE}`);
    assert.dom(SUFFIX_DECORATION).doesNotExist();

    // Edit mode: only the base portion is shown with the suffix decoration.
    await click(commonSelectors.EDIT_BTN);
    assert.dom(VALUE_INPUT).hasValue(SEED_BASE_VALUE);
    assert.dom(SUFFIX_DECORATION).hasText(COMBINED_SUFFIX_VALUE);
  });

  test('updating a project alias submits the user input and the server composes the suffixed value', async function (assert) {
    await visit(urls.alias);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(VALUE_INPUT, NEW_BASE_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      instances.alias.value,
      `${NEW_BASE_VALUE}${COMBINED_SUFFIX_VALUE}`,
    );
  });

  test('cancelling an edit leaves the composed value unchanged', async function (assert) {
    const originalValue = instances.alias.value;

    await visit(urls.alias);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(VALUE_INPUT, NEW_BASE_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(instances.alias.value, originalValue);
  });

  test('saving without typing recomposes the alias value when the project scope suffix has changed', async function (assert) {
    const NEW_PROJECT_SUFFIX = '.updated';
    instances.scopes.project.update({ alias_suffix: NEW_PROJECT_SUFFIX });

    await visit(urls.alias);

    await click(commonSelectors.EDIT_BTN);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      instances.alias.value,
      `${SEED_BASE_VALUE}${NEW_PROJECT_SUFFIX}${ORG_SUFFIX_VALUE}`,
    );
  });
});
