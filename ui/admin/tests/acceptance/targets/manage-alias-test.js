/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | targets | manage-alias', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let aliasResourceTwo, aliasResourceOne, getAliasCount;
  const ALIASES_SIDEBAR = '.target-sidebar-aliases';
  const ALIASES_SIDEBAR_LIST = '.link-list-item';
  const DROPDOWN_ACTION = '[data-test-manage-target-alias] button';
  const CLEAR_BTN_SELECTOR = '.hds-dropdown-list-item--color-action button';
  const LINK_TO_NEW_ALIAS = '.target-sidebar-aliases .hds-button';
  const DEST_FIELD_SELECTOR = '[name="destination_id"]';
  const ITEM_SELECTOR = '.link-list-item a';

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
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    sshTarget: null,
    tcpTarget: null,
    tcpAlias: null,
    aliases: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;

    urls.tcpAlias = `${urls.tcpTarget}/${aliasResourceOne.id}`;

    getAliasCount = () => this.server.schema.aliases.all().models.length;

    await authenticateSession({ username: 'admin' });
  });

  test('clicking on manage should take you to manage page', async function (assert) {
    await visit(urls.tcpTarget);
    assert.dom(ALIASES_SIDEBAR).exists();
    assert.dom(ALIASES_SIDEBAR_LIST).exists();
    await click(ITEM_SELECTOR);

    assert.strictEqual(currentURL(), urls.tcpAlias);
    await a11yAudit();
  });

  test('clicking on `clear alias` from the dropdown should remove the destination ID and alias should disapper from the target sidebar', async function (assert) {
    aliasResourceOne.update({
      destination_id: instances.tcpTarget.id,
    });
    await visit(urls.tcpTarget);
    assert.dom(ALIASES_SIDEBAR).exists();
    assert.dom(ALIASES_SIDEBAR_LIST).exists();

    await click(ITEM_SELECTOR);

    assert.strictEqual(currentURL(), urls.tcpAlias);
    await click(DROPDOWN_ACTION);

    await click(CLEAR_BTN_SELECTOR);

    const id = aliasResourceOne.id;
    const associatedAlias = this.server.schema.aliases.findBy({ id });
    assert.strictEqual(associatedAlias.destinationId, null);

    assert.strictEqual(currentURL(), urls.tcpTarget);

    assert.dom(ALIASES_SIDEBAR_LIST).doesNotExist();
    assert.dom(LINK_TO_NEW_ALIAS).exists;
  });

  test('clicking on `delete alias` from the dropdown should remove the destination ID and alias should disapper from the target sidebar and deleted from aliases list', async function (assert) {
    const aliasCount = getAliasCount();
    aliasResourceOne.update({
      destination_id: instances.tcpTarget.id,
    });
    await visit(urls.tcpTarget);
    assert.dom(ALIASES_SIDEBAR).exists();
    assert.dom(ALIASES_SIDEBAR_LIST).exists();

    await click(ITEM_SELECTOR);

    assert.dom(DEST_FIELD_SELECTOR).doesNotHaveAttribute('readOnly');

    assert.strictEqual(currentURL(), urls.tcpAlias);
    await click(DROPDOWN_ACTION);

    await click(commonSelectors.DELETE_BTN);

    assert.strictEqual(getAliasCount(), aliasCount - 1);

    assert.strictEqual(currentURL(), urls.tcpTarget);

    assert.dom(ALIASES_SIDEBAR_LIST).doesNotExist();
    assert.dom(LINK_TO_NEW_ALIAS).exists;
  });
});
