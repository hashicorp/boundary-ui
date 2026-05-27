/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | aliases | project | gated', function (hooks) {
  setupApplicationTest(hooks);

  const SUFFIX_VALUE = '.example';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    projectScope: null,
    orgScope: null,
    aliases: null,
    addAliasSuffix: null,
    addOrgAliasSuffix: null,
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
      alias_suffix: null,
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
      alias_suffix: null,
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.aliases = `${urls.projectScope}/aliases`;
    urls.addAliasSuffix = `${urls.projectScope}/add-alias-suffix`;
    urls.addOrgAliasSuffix = `${urls.orgScope}/add-alias-suffix`;
    urls.newAlias = `${urls.aliases}/new`;
  });

  test('aliases nav link is visible on a project scope', async function (assert) {
    await visit(urls.projectScope);

    assert.dom(commonSelectors.SIDEBAR_NAV_LINK(urls.aliases)).isVisible();
  });

  test('shows the gated empty state when project scope has no alias suffix', async function (assert) {
    await visit(urls.aliases);

    assert.dom(selectors.GATED_STATE_LINK_PROJECT).isVisible();
    assert.dom(selectors.GATED_STATE_LINK_ORG).isVisible();
    assert.dom(commonSelectors.HREF(urls.newAlias)).doesNotExist();
  });

  test('gated CTA for project navigates to the project add alias suffix page', async function (assert) {
    await visit(urls.aliases);
    await click(selectors.GATED_STATE_LINK_PROJECT);

    assert.strictEqual(currentURL(), urls.addAliasSuffix);
  });

  test('gated CTA for org navigates to the org add alias suffix page', async function (assert) {
    await visit(urls.aliases);
    await click(selectors.GATED_STATE_LINK_ORG);

    assert.strictEqual(currentURL(), urls.addOrgAliasSuffix);
  });

  test('shows only org link when project has suffix but org does not', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });

    await visit(urls.aliases);

    assert.dom(selectors.GATED_STATE_LINK_PROJECT).doesNotExist();
    assert.dom(selectors.GATED_STATE_LINK_ORG).isVisible();
  });

  test('shows only project link when org has suffix but project does not', async function (assert) {
    instances.scopes.org.update({ alias_suffix: SUFFIX_VALUE });

    await visit(urls.aliases);

    assert.dom(selectors.GATED_STATE_LINK_PROJECT).isVisible();
    assert.dom(selectors.GATED_STATE_LINK_ORG).doesNotExist();
  });

  test('gated state is not shown when user cannot set an alias suffix', async function (assert) {
    instances.scopes.project.update({
      authorized_actions: instances.scopes.project.authorized_actions.filter(
        (action) => action !== 'set-alias-target-suffix',
      ),
    });
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (action) => action !== 'set-alias-target-suffix',
      ),
    });

    await visit(urls.aliases);

    assert.dom(selectors.GATED_STATE).doesNotExist();
    assert
      .dom(commonSelectors.PAGE_MESSAGE_HEADER)
      .hasText(
        this.owner
          .lookup('service:intl')
          .t('resources.alias.messages.none.title'),
      );
  });

  test('shows the normal aliases empty state when both scopes have an alias suffix', async function (assert) {
    instances.scopes.org.update({ alias_suffix: SUFFIX_VALUE });
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });

    await visit(urls.aliases);

    assert.dom(selectors.GATED_STATE).doesNotExist();
    assert
      .dom(commonSelectors.PAGE_MESSAGE_HEADER)
      .hasText(
        this.owner
          .lookup('service:intl')
          .t('resources.alias.messages.none.title'),
      );
  });
});
