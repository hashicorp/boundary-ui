/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import * as selectors from './selectors';
import { TYPE_TARGET_TCP } from 'api/models/target';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | targets | aliases | gated', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks, 'en-us');

  const SUFFIX_VALUE = '.example';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };

  const urls = {
    projectScope: null,
    target: null,
    addAliasSuffix: null,
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
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      type: TYPE_TARGET_TCP,
    });

    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.target = `${urls.projectScope}/targets/${instances.target.id}`;
    urls.addAliasSuffix = `${urls.projectScope}/add-alias-suffix`;
  });

  test('shows the gated state when the project scope has no alias suffix', async function (assert) {
    await visit(urls.target);

    assert.dom(selectors.ALIASES_GATED).isVisible();
    assert.dom(selectors.ALIASES_GATED_LINK).isVisible();
    assert.dom(selectors.ALIASES_NEW_LINK).doesNotExist();
  });

  test('gated CTA navigates to the add alias suffix page', async function (assert) {
    await visit(urls.target);
    await click(selectors.ALIASES_GATED_LINK);

    assert.strictEqual(currentURL(), urls.addAliasSuffix);
  });

  test('shows the "Add an alias" empty state when the project scope has an alias suffix', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });

    await visit(urls.target);

    assert.dom(selectors.ALIASES_GATED).doesNotExist();
    assert.dom(selectors.ALIASES_NEW_LINK).isVisible();
    assert
      .dom(selectors.ALIASES_NEW_LINK)
      .hasText(selectors.ALIASES_NEW_LINK_TEXT);
  });
});
