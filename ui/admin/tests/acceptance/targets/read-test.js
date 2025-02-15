/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | targets | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;
  let aliasResource;
  const ALIASES_SIDEBAR = '.target-sidebar-aliases';
  const ALIASES_SIDEBAR_LIST = '.link-list-item';
  const LINK_TO_NEW_ALIAS = '.target-sidebar-aliases .hds-button';
  const VIEW_MORE_BTN = '[data-test-view-more]';
  const FLYOUT_COMPONENT = '[data-test-flyout]';

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
    alias: null,
    aliases: null,
  };

  hooks.beforeEach(async function () {
    featuresService = this.owner.lookup('service:features');
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
    instances.sshTarget = this.server.create('target', {
      type: TYPE_TARGET_SSH,
      scope: instances.scopes.project,
    });
    instances.tcpTarget = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
    });

    instances.alias = this.server.createList('alias', 1, {
      scope: instances.scopes.global,
      value: 'alias 1',
    });

    aliasResource = instances.alias[0];

    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.aliases = `${urls.globalScope}/aliases`;

    urls.alias = `${urls.tcpTarget}/${aliasResource.id}`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting ssh target', async function (assert) {
    featuresService.enable('ssh-target');

    await visit(urls.targets);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.targets);

    await click(`[href="${urls.sshTarget}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sshTarget);
  });

  test('visiting tcp target', async function (assert) {
    await visit(urls.targets);
    assert.strictEqual(currentURL(), urls.targets);

    await click(`[href="${urls.tcpTarget}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.tcpTarget);
  });

  test('cannot navigate to an ssh target form without proper authorization', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.projectScope);
    instances.sshTarget.authorized_actions =
      instances.sshTarget.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.targets}"]`);

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.tcpTarget)).isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.sshTarget))
      .doesNotExist();
  });

  test('cannot navigate to a tcp target form without proper authorization', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.projectScope);
    instances.tcpTarget.authorized_actions =
      instances.tcpTarget.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.targets}"]`);

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.sshTarget)).isVisible();
    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.tcpTarget))
      .doesNotExist();
  });

  test('visiting an unknown target displays 404 message', async function (assert) {
    await visit(urls.unknownTarget);
    await a11yAudit();

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can link to docs page for target', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/targets"]`,
      )
      .exists();
  });

  test('users can navigate to target and incorrect url auto-corrects', async function (assert) {
    const incorrectUrl = `/scopes/${instances.scopes.org.id}/targets/${instances.sshTarget.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), urls.sshTarget);
  });

  test('can view aliases on the right sidebar', async function (assert) {
    instances.tcpTarget.update({
      aliases: [{ id: aliasResource.id, value: aliasResource.value }],
    });
    await visit(urls.tcpTarget);
    assert.dom(ALIASES_SIDEBAR).exists();
    assert.dom(ALIASES_SIDEBAR_LIST).exists();
    assert.strictEqual(
      find(ALIASES_SIDEBAR_LIST).textContent.trim(),
      'alias 1',
    );
  });

  test('cannot view aliases list on the right sidebar if there is no alias associated with the target', async function (assert) {
    aliasResource.authorized_collection_actions = ['create'];
    await visit(urls.tcpTarget);
    assert.dom(ALIASES_SIDEBAR).exists();
    assert.dom(LINK_TO_NEW_ALIAS).hasText('Add an alias');
    assert.dom(ALIASES_SIDEBAR_LIST).doesNotExist();
  });

  test('user should not see add a new alias button without proper auth ', async function (assert) {
    instances.scopes.global.authorized_collection_actions['aliases'] =
      instances.scopes.global.authorized_collection_actions['aliases'].filter(
        (item) => item !== 'create',
      );
    await visit(urls.tcpTarget);

    assert.dom(ALIASES_SIDEBAR).doesNotExist();
    assert.dom(LINK_TO_NEW_ALIAS).doesNotExist();
    assert.dom(ALIASES_SIDEBAR_LIST).doesNotExist();
  });

  test('can click `view more aliases` to see the remaining associated aliases if there are more than 3', async function (assert) {
    instances.tcpTarget.update({
      aliases: [
        { id: aliasResource.id, value: 'alias 1' },
        { id: aliasResource.id, value: 'alias 5' },
        { id: aliasResource.id, value: 'alias 2' },
        { id: aliasResource.id, value: 'alias 4' },
      ],
    });
    await visit(urls.tcpTarget);

    assert.dom(ALIASES_SIDEBAR).exists();
    assert.dom(VIEW_MORE_BTN).exists();
    await click(VIEW_MORE_BTN);
    assert.dom(FLYOUT_COMPONENT).exists();
  });
});
