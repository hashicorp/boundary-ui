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

module('Acceptance | aliases | project | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const SUFFIX_VALUE = '.example';
  const BASE_VALUE = 'myhost';
  const VALUE_INPUT = '[name=value]';
  const SUFFIX_DECORATION = '[data-test-alias-suffix-decoration]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
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

    urls.aliases = `/scopes/${instances.scopes.project.id}/aliases`;
    urls.newAlias = `${urls.aliases}/new`;
  });

  test('renders the suffix decoration on a project scope with a suffix', async function (assert) {
    await visit(urls.newAlias);

    assert.dom(VALUE_INPUT).isVisible();
    assert.dom(SUFFIX_DECORATION).hasText(SUFFIX_VALUE);
  });

  test('creating a project alias submits the user input as value and the server composes the suffixed value', async function (assert) {
    await visit(urls.newAlias);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(VALUE_INPUT, BASE_VALUE);
    await click(commonSelectors.SAVE_BTN);

    const alias = this.server.schema.aliases.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(alias.base_value, BASE_VALUE);
    assert.strictEqual(alias.value, `${BASE_VALUE}${SUFFIX_VALUE}`);
  });
});
