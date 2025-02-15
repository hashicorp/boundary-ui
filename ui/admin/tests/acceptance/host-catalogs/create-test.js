/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;
  let getHostCatalogCount;

  const NAME_INPUT_SELECTOR = '[name="name"]';
  const DESCRIPTION_INPUT_SELECTOR = '[name="description"]';
  const TYPE_INPUT_SELECTOR = '[name="Type"]';
  const SAVE_BUTTON_SELECTOR = '[type="submit"]';
  const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const WORKER_FILTER_INPUT_SELECTOR = '[name=worker_filter]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    orgScope: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    newHostCatalog: null,
    newStaticHostCatalog: null,
    newAWSDynamicHostCatalog: null,
    newAzureDynamicHostCatalog: null,
    newGCPDynamicHostCatalog: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren',
    );
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
    urls.orgScope = `/scopes/${instances.orgScope.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;

    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.newHostCatalog = `${urls.hostCatalogs}/new`;
    urls.newStaticHostCatalog = `${urls.newHostCatalog}?type=static`;
    urls.newAWSDynamicHostCatalog = `${urls.newHostCatalog}?type=aws`;
    urls.newAzureDynamicHostCatalog = `${urls.newHostCatalog}?type=azure`;
    urls.newGCPDynamicHostCatalog = `${urls.newHostCatalog}?type=gcp`;
    featuresService = this.owner.lookup('service:features');

    // Generate resource counter
    getHostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;

    await authenticateSession({});
  });

  test('Users can create new static host catalogs', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newStaticHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await fillIn(DESCRIPTION_INPUT_SELECTOR, 'random string');
    await fillIn(TYPE_INPUT_SELECTOR, 'static');
    await click(SAVE_BUTTON_SELECTOR);
    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic aws host catalogs with aws provider', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newAWSDynamicHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await fillIn(DESCRIPTION_INPUT_SELECTOR, 'random string');
    await fillIn(TYPE_INPUT_SELECTOR, 'aws');
    await click(SAVE_BUTTON_SELECTOR);
    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic azure host catalogs with azure provider', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newAzureDynamicHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await fillIn(DESCRIPTION_INPUT_SELECTOR, 'random string');
    await fillIn(TYPE_INPUT_SELECTOR, 'azure');
    await click(SAVE_BUTTON_SELECTOR);
    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic host catalogs with GCP provider ', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newGCPDynamicHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await fillIn(DESCRIPTION_INPUT_SELECTOR, 'random string');
    await fillIn('[name="zone"]', 'random string');
    await fillIn('[name="project_id"]', 'random string');
    await fillIn('[name="client_email"]', 'random string');
    await click(SAVE_BUTTON_SELECTOR);
    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can cancel creation of new static host catalogs', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newStaticHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs with AWS provider', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newAWSDynamicHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs with GCP provider', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newGCPDynamicHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs with Azure provider', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newAzureDynamicHostCatalog);
    await fillIn(NAME_INPUT_SELECTOR, 'random string');
    await click(CANCEL_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can navigate to new static host catalogs route with proper authorization', async function (assert) {
    await visit(urls.hostCatalogs);
    assert.ok(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert.dom(`[href="${urls.newHostCatalog}"]`).isVisible();
  });

  test('Users cannot navigate to new static host catalogs route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      [];
    await visit(urls.hostCatalogs);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert.dom(`[href="${urls.newStaticHostCatalog}"]`).isNotVisible();
  });

  test('saving a new static host catalog with invalid fields displays error messages', async function (assert) {
    this.server.post('/host-catalogs', () => {
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
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.newStaticHostCatalog);
    await click(SAVE_BUTTON_SELECTOR);
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .includesText('The request was invalid.');
    assert.dom('[data-test-error-message-name]').hasText('Name is required.');
  });

  test('users should not see worker filter field in community edition when AWS host catalog is selected', async function (assert) {
    await visit(urls.newAWSDynamicHostCatalog);
    assert.dom(WORKER_FILTER_INPUT_SELECTOR).isNotVisible();
  });

  test('users should not see worker filter field in community edition when GCP host catalog is selected', async function (assert) {
    await visit(urls.newGCPDynamicHostCatalog);
    assert.dom(WORKER_FILTER_INPUT_SELECTOR).isNotVisible();
  });

  test('users should see worker filter field in enterprise edition when AWS host catalog is selected', async function (assert) {
    featuresService.enable('host-catalog-worker-filter');
    await visit(urls.newAWSDynamicHostCatalog);
    assert.dom(WORKER_FILTER_INPUT_SELECTOR).isVisible();
  });

  test('users should see worker filter field in enterprise edition when GCP host catalog is selected', async function (assert) {
    featuresService.enable('host-catalog-worker-filter');
    await visit(urls.newAWSDynamicHostCatalog);
    assert.dom(WORKER_FILTER_INPUT_SELECTOR).isVisible();
  });

  test('users cannot directly navigate to new host catalog route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions['host-catalogs'] =
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].filter((item) => item !== 'create');

    await visit(urls.newHostCatalog);

    assert.false(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.hostCatalogs);
  });
});
