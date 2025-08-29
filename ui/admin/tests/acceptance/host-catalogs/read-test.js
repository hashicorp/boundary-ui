/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalogs: null,
    hostCatalog: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
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
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.unknownHostCatalog = `${urls.hostCatalogs}/foo`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting host catalogs', async function (assert) {
    await visit(urls.hostCatalogs);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.hostCatalogs);

    await click(commonSelectors.HREF(urls.hostCatalog));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.hostCatalog);
  });

  test('cannot navigate to a host catalog form without proper authorization', async function (assert) {
    await visit(urls.projectScope);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'read',
      );

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert
      .dom(commonSelectors.TABLE_RESOURCE_LINK(urls.hostCatalog))
      .doesNotExist();
  });

  test('visiting an unknown host catalog displays 404 message', async function (assert) {
    await visit(urls.unknownHostCatalog);
    await a11yAudit();

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can link to docs page for host catalog', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.hostCatalogs));

    assert
      .dom(
        commonSelectors.HREF(
          'https://developer.hashicorp.com/boundary/docs/concepts/domain-model/host-catalogs',
        ),
      )
      .exists();
  });

  test('users can navigate to host catalog and incorrect url autocorrects', async function (assert) {
    const projectScope = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    const hostCatalog = this.server.create('host-catalog', {
      scope: projectScope,
    });
    const incorrectUrl = `${urls.hostCatalogs}/${hostCatalog.id}/host-sets`;
    const correctUrl = `/scopes/${projectScope.id}/host-catalogs/${hostCatalog.id}/host-sets`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
