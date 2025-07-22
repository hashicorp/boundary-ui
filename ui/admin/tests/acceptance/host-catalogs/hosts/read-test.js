/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | hosts | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    hostCatalog: null,
    host: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null,
    host: null,
    unknownHost: null,
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
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.host = `${urls.hosts}/${instances.host.id}`;
    urls.unknownHost = `${urls.hosts}/foo`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting hosts', async function (assert) {
    await visit(urls.hosts);

    assert.strictEqual(currentURL(), urls.hosts);

    await click(commonSelectors.HREF(urls.host));

    assert.strictEqual(currentURL(), urls.host);
  });

  test('cannot navigate to a host form without proper authorization', async function (assert) {
    await visit(urls.hostCatalog);
    instances.host.authorized_actions =
      instances.host.authorized_actions.filter((item) => item !== 'read');

    await click(commonSelectors.HREF(urls.hosts));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.host)).doesNotExist();
  });

  test('visiting an unknown host displays 404 message', async function (assert) {
    await visit(urls.unknownHost);

    assert
      .dom(commonSelectors.RESOURCE_NOT_FOUND_SUBTITLE)
      .hasText(commonSelectors.RESOURCE_NOT_FOUND_VALUE);
  });

  test('users can link to docs page for hosts', async function (assert) {
    await visit(urls.hosts);

    await click(commonSelectors.HREF(urls.host));
    assert
      .dom(
        commonSelectors.HREF(
          'https://developer.hashicorp.com/boundary/docs/concepts/domain-model/hosts',
        ),
      )
      .exists();
  });

  test('users can navigate to host and incorrect url autocorrects', async function (assert) {
    const hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'static',
    });
    const host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog,
    });
    const incorrectUrl = `${urls.hosts}/${host.id}`;
    const correctUrl = `${urls.hostCatalogs}/${hostCatalog.id}/hosts/${host.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
