/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | host-sets | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    hostSet: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    unknownHostSet: null,
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
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.unknownHostSet = `${urls.hostSets}/foo`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting host sets', async function (assert) {
    await visit(urls.hostSets);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.hostSets);

    await click(commonSelectors.HREF(urls.hostSet));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.hostSet);
  });

  test('cannot navigate to a host set form without proper authorization', async function (assert) {
    await visit(urls.hostCatalog);
    instances.hostSet.authorized_actions =
      instances.hostSet.authorized_actions.filter((item) => item !== 'read');

    await click(commonSelectors.HREF(urls.hostSets));

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.hostSet))
      .doesNotExist();
  });

  test('visiting an unknown host set displays 404 message', async function (assert) {
    await visit(urls.unknownHostSet);
    await a11yAudit();

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can link to docs page for host sets', async function (assert) {
    await visit(urls.hostSets);

    await click(commonSelectors.HREF(urls.hostSet));

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/host-sets"]`,
      )
      .exists();
  });

  test('users can navigate to host set and incorrect url auto-corrects', async function (assert) {
    const hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'static',
    });
    const hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog,
    });
    const incorrectUrl = `${urls.hostSets}/${hostSet.id}`;
    const correctUrl = `${urls.hostCatalogs}/${hostCatalog.id}/host-sets/${hostSet.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
