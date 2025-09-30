/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | hosts | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  let getHostCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
    },
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
    newHost: null,
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
      type: 'static',
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
    urls.newHost = `${urls.hosts}/new`;
    // Generate resource couner
    getHostCount = () => this.server.schema.hosts.all().models.length;
    await authenticateSession({});
  });

  test('can create new host', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCount();
    await visit(urls.newHost);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_ADDRESS, selectors.FIELD_ADDRESS_VALUE);
    await click(commonSelectors.SAVE_BTN);
    assert.strictEqual(getHostCount(), count + 1);
  });

  test('Users cannot create a new host without proper authorization', async function (assert) {
    instances.hostCatalog.authorized_collection_actions.hosts = [];
    await visit(urls.hostCatalog);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create',
      ),
    );

    assert.dom(commonSelectors.HREF(urls.newHost)).doesNotExist();
  });

  test('Users can navigate to new host route with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.hosts);

    assert.ok(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create',
      ),
    );
    assert.dom(selectors.MANAGE_DROPDOWN_HOST_CATALOG).exists();
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG);
    assert
      .dom(selectors.MANAGE_DROPDOWN_HOST_CATALOG_NEW_HOST)
      .hasAttribute('href', urls.newHost);
    await click(selectors.MANAGE_DROPDOWN_HOST_CATALOG_NEW_HOST);
    assert.strictEqual(currentURL(), urls.newHost);
  });

  test('Users cannot navigate to new host route without proper authorization', async function (assert) {
    instances.hostCatalog.authorized_collection_actions.hosts = [];
    await visit(urls.hosts);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.newHost)).doesNotExist();
  });

  test('can cancel create new host', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCount();
    await visit(urls.newHost);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.hosts);
    assert.strictEqual(getHostCount(), count);
  });

  test('saving a new host with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/hosts', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'address',
                description: 'Address is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.newHost);
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');

    assert.dom(selectors.FIELD_ADDRESS_ERROR).hasText('Address is required.');
  });

  test('users cannot directly navigate to new host route without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.hostCatalog.authorized_collection_actions.hosts =
      instances.hostCatalog.authorized_collection_actions.hosts.filter(
        (item) => item !== 'create',
      );

    await visit(urls.newHost);

    assert.false(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.hosts);
  });
});
