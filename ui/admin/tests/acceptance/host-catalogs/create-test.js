/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;
  let featureEdition;
  let getHostCatalogCount;

  const instances = {
    scopes: {
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
    featureEdition = this.owner.lookup('service:featureEdition');

    // Generate resource counter
    getHostCatalogCount = () =>
      this.server.schema.hostCatalogs.all().models.length;
  });

  test('Users can create new static host catalogs', async function (assert) {
    const count = getHostCatalogCount();
    await visit(urls.newStaticHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_TYPE, selectors.FIELD_TYPE_VALUE('static'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic aws host catalogs with aws provider', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newAWSDynamicHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_TYPE, selectors.FIELD_TYPE_VALUE('aws'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic azure host catalogs with azure provider', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newAzureDynamicHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_TYPE, selectors.FIELD_TYPE_VALUE('azure'));
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can create new dynamic host catalogs with GCP provider ', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newGCPDynamicHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_ZONE, selectors.FIELD_ZONE_VALUE);
    await fillIn(selectors.FIELD_PROJECT, selectors.FIELD_PROJECT_VALUE);
    await fillIn(
      selectors.FIELD_CLIENT_EMAIL,
      selectors.FIELD_CLIENT_EMAIL_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getHostCatalogCount(), count + 1);
  });

  test('Users can cancel creation of new static host catalogs', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newStaticHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs with AWS provider', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newAWSDynamicHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs with GCP provider', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newGCPDynamicHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can cancel creation of new dynamic host catalogs with Azure provider', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getHostCatalogCount();
    await visit(urls.newAzureDynamicHostCatalog);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.hostCatalogs);
    assert.strictEqual(getHostCatalogCount(), count);
  });

  test('Users can navigate to new static host catalogs route with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.hostCatalogs);

    assert.ok(
      instances.scopes.project.authorized_collection_actions[
        'host-catalogs'
      ].includes('create'),
    );

    assert.dom(commonSelectors.HREF(urls.newHostCatalog)).isVisible();
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

    assert.dom(commonSelectors.HREF(urls.newStaticHostCatalog)).doesNotExist();
  });

  test('saving a new static host catalog with invalid fields displays error messages', async function (assert) {
    const errorMsg =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.post('/host-catalogs', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
          details: {
            request_fields: [
              {
                name: 'name',
                description: errorMsg,
              },
            ],
          },
        },
      );
    });

    await visit(urls.newStaticHostCatalog);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).includesText(errorMsg);
  });

  test('users should not see worker filter field in community edition when AWS host catalog is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.newAWSDynamicHostCatalog);

    assert.dom(selectors.FIELD_WORKER_FILTER).doesNotExist();
  });

  test('users should not see worker filter field in community edition when GCP host catalog is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.newGCPDynamicHostCatalog);

    assert.dom(selectors.FIELD_WORKER_FILTER).doesNotExist();
  });

  test('users should see optional worker filter field in enterprise edition when AWS host catalog is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('worker-filter');
    featureEdition.setEdition('enterprise');
    await visit(urls.newAWSDynamicHostCatalog);

    assert.dom(selectors.FIELD_WORKER_FILTER).isVisible();
    assert
      .dom(selectors.FIELD_AWS_WORKER_FILTER_LABEL)
      .includesText('Optional');
  });

  test('users should see required worker filter field in hcp edition when AWS host catalog is selected and using assume role', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('worker-filter');
    featureEdition.setEdition('hcp');
    await visit(urls.newAWSDynamicHostCatalog);

    await click(selectors.FIELD_DYNAMIC_CREDENTIAL);

    assert.dom(selectors.FIELD_WORKER_FILTER).isVisible();
    assert
      .dom(selectors.FIELD_AWS_WORKER_FILTER_LABEL)
      .includesText('Required');
  });

  test('users should see optional worker filter field in hcp edition when AWS host catalog is selected and using access key', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('worker-filter');
    featureEdition.setEdition('hcp');
    await visit(urls.newAWSDynamicHostCatalog);

    await click(selectors.FIELD_STATIC_CREDENTIAL);

    assert.dom(selectors.FIELD_WORKER_FILTER).isVisible();
    assert
      .dom(selectors.FIELD_AWS_WORKER_FILTER_LABEL)
      .includesText('Optional');
  });

  test('users should see worker filter field in enterprise edition when GCP host catalog is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('worker-filter');
    await visit(urls.newAWSDynamicHostCatalog);

    assert.dom(selectors.FIELD_WORKER_FILTER).isVisible();
  });

  test('users cannot directly navigate to new host catalog route without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
