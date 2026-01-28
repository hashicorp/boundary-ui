/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | targets | manage-alias', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let aliasResourceTwo, aliasResourceOne, getAliasCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    sshTarget: null,
    tcpTarget: null,
    alias: null,
  };

  const urls = {
    projectScope: null,
    targets: null,
    sshTarget: null,
    tcpTarget: null,
    tcpAlias: null,
    aliases: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.alias = this.server.createList('alias', 2, {
      scope: instances.scopes.global,
    });

    aliasResourceOne = instances.alias[0];
    aliasResourceTwo = instances.alias[1];

    instances.sshTarget = this.server.create('target', {
      type: TYPE_TARGET_SSH,
      scope: instances.scopes.project,
      aliases: [
        { id: aliasResourceOne.id, value: aliasResourceOne.value },
        { id: aliasResourceTwo.id, value: aliasResourceTwo.value },
      ],
    });
    instances.tcpTarget = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
      aliases: [{ id: aliasResourceOne.id, value: aliasResourceOne.value }],
    });

    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.tcpAlias = `${urls.tcpTarget}/${aliasResourceOne.id}`;

    getAliasCount = () => this.server.schema.aliases.all().models.length;
  });

  test('clicking on manage should take you to manage page', async function (assert) {
    await visit(urls.tcpTarget);

    assert.dom(selectors.ALIASES_SIDEBAR).isVisible();
    assert.dom(selectors.ALIASES_SIDEBAR_LIST).isVisible();

    await click(selectors.LINK_LIST_ITEM);

    assert.strictEqual(currentURL(), urls.tcpAlias);
  });

  test('clicking on `clear alias` from the dropdown should remove the destination ID and alias should disapper from the target sidebar', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    aliasResourceOne.update({
      destination_id: instances.tcpTarget.id,
    });
    await visit(urls.tcpTarget);

    assert.dom(selectors.ALIASES_SIDEBAR).isVisible();
    assert.dom(selectors.ALIASES_SIDEBAR_LIST).isVisible();

    await click(selectors.LINK_LIST_ITEM);

    assert.strictEqual(currentURL(), urls.tcpAlias);

    await click(selectors.MANAGE_ALIAS_DROPDOWN);
    await click(selectors.MANAGE_ALIAS_DROPDOWN_CLEAR);

    const id = aliasResourceOne.id;
    const associatedAlias = this.server.schema.aliases.findBy({ id });
    assert.strictEqual(associatedAlias.destinationId, null);
    assert.strictEqual(currentURL(), urls.tcpTarget);
    assert.dom(selectors.ALIASES_SIDEBAR_LIST).doesNotExist();
    assert.dom(selectors.ALIASES_NEW_LINK).isVisible();
  });

  test('clicking on `delete alias` from the dropdown should remove the destination ID and alias should disapper from the target sidebar and deleted from aliases list', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const aliasCount = getAliasCount();
    aliasResourceOne.update({
      destination_id: instances.tcpTarget.id,
    });
    await visit(urls.tcpTarget);

    assert.dom(selectors.ALIASES_SIDEBAR).isVisible();
    assert.dom(selectors.ALIASES_SIDEBAR_LIST).isVisible();

    await click(selectors.LINK_LIST_ITEM);

    assert.dom(selectors.FIELD_DESTINATION_ID).doesNotHaveAttribute('readOnly');
    assert.strictEqual(currentURL(), urls.tcpAlias);

    await click(selectors.MANAGE_ALIAS_DROPDOWN);
    await click(commonSelectors.DELETE_BTN);

    assert.strictEqual(getAliasCount(), aliasCount - 1);
    assert.strictEqual(currentURL(), urls.tcpTarget);
    assert.dom(selectors.ALIASES_SIDEBAR_LIST).doesNotExist();
    assert.dom(selectors.ALIASES_NEW_LINK).isVisible();
  });
});
