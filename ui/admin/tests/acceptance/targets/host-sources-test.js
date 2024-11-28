/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | targets | host-sources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetHostSetCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-targets-dropdown] button:first-child';
  const ADD_HOSTSOURCE_SELECTOR = '[data-test-manage-targets-dropdown] ul li a';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
    hostCatalog: null,
    hostCatalogPlugin: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    targetHostSources: null,
    targetAddHostSources: null,
  };

  hooks.beforeEach(function () {
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
    instances.hostCatalog = this.server.create(
      'host-catalog',
      {
        scope: instances.scopes.project,
      },
      'withChildren',
    );
    // creates "unknown" host-set for target host sources
    instances.hostCatalogPlugin = this.server.create(
      'host-catalog',
      {
        type: 'plugin',
        plugin: { name: 'shh' },
        scope: instances.scopes.project,
      },
      'withChildren',
    );
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      hostSets: instances.hostCatalog.hostSets,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetHostSources = `${urls.target}/host-sources`;
    urls.targetAddHostSources = `${urls.target}/add-host-sources`;
    urls.hostSet = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/host-sets/${instances.hostCatalog.hostSetIds[0]}`;
    urls.unknownHostSet =
      // Generate resource counter
      getTargetHostSetCount = () =>
        this.server.schema.targets.first().hostSets.models.length;
    authenticateSession({ username: 'admin' });
  });

  test('visiting target host sources', async function (assert) {
    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.targetHostSources);
    assert.dom('tbody tr').exists({ count: targetHostSetCount });
  });

  test('can navigate to a known host set type', async function (assert) {
    await visit(urls.targetHostSources);

    await click(`[href="${urls.hostSet}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.hostSet);
  });

  test('cannot navigate to an unknown host set type', async function (assert) {
    instances.target.update({
      hostSets: instances.hostCatalogPlugin.hostSets,
    });
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);

    assert
      .dom(
        commonSelectors.TABLE_RESOURCE_LINK(
          instances.hostCatalogPlugin.hostSets[0],
        ),
      )
      .doesNotExist();
  });

  test('can remove a host set', async function (assert) {
    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');

    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount - 1);
    assert.dom('tbody tr').exists({ count: targetHostSetCount - 1 });
  });

  test('cannot remove a host set without proper authorization', async function (assert) {
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-host-sources',
      );
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);

    assert.dom('tbody tr .rose-dropdown-button-danger').doesNotExist();
  });

  test('removing a target host set which errors displays error messages', async function (assert) {
    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');

    assert.dom('tbody tr').exists({ count: targetHostSetCount });
    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
  });

  test('select and save host sets to add', async function (assert) {
    instances.target.update({ hostSetIds: [] });
    await visit(urls.target);
    const targetHostSetCount = getTargetHostSetCount();
    await click(`[href="${urls.targetHostSources}"]`);
    assert.dom('tbody tr').exists({ count: 0 });
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_HOSTSOURCE_SELECTOR);
    assert.strictEqual(currentURL(), urls.targetAddHostSources);

    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await click(`[href="${urls.targetHostSources}"]`);

    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount + 1);
    assert.dom('tbody tr').exists({ count: targetHostSetCount + 1 });
  });

  test('cannot add host sources without proper authorization', async function (assert) {
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-host-sources',
      );
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    assert.dom(ADD_HOSTSOURCE_SELECTOR).doesNotIncludeText('Add Host Sources');
  });

  test('select and cancel host sets to add', async function (assert) {
    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(`[href="${urls.targetHostSources}"]`);
    assert.dom('tbody tr').exists({ count: targetHostSetCount });

    // first, remove a target host set (otherwise none would be available to add)
    await click('.hds-dropdown-toggle-icon');
    await click('tbody tr .hds-dropdown-list-item button');
    assert.dom('tbody tr').exists({ count: targetHostSetCount - 1 });

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_HOSTSOURCE_SELECTOR);
    assert.strictEqual(currentURL(), urls.targetAddHostSources);
    await click('tbody label');
    await click('form [type="button"]');

    assert.strictEqual(currentURL(), urls.targetHostSources);
    assert.dom('tbody tr').exists({ count: targetHostSetCount - 1 });
    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount - 1);
  });

  test('adding a target host set which errors displays error messages', async function (assert) {
    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.targetHostSources);
    instances.target.update({ hostSetIds: [] });
    const targetHostSetCount = getTargetHostSetCount();

    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_HOSTSOURCE_SELECTOR);
    assert.strictEqual(targetHostSetCount, 0);
    await click('tbody label');
    await click('form [type="submit"]');

    assert.strictEqual(currentURL(), urls.targetAddHostSources);
    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount);
    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('The request was invalid.');
  });

  test('saving host source with address brings up confirmation modal and removes address', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const target = this.server.create('target', {
      scope: instances.scopes.project,
      address: '0.0.0.0',
    });
    const targetHostSetCount = this.server.schema.targets.find(target.id)
      .hostSets.models.length;
    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );

    const targetUrl = `${urls.targets}/${target.id}`;
    await visit(targetUrl);
    await click(`[href="${targetUrl}/host-sources"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_HOSTSOURCE_SELECTOR);

    await click('tbody label');
    await click('form [type="submit"]');

    assert.dom('.rose-dialog').isVisible();
    await click('.rose-dialog-footer .rose-button-primary', 'Remove resources');

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      null,
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.models.length,
      targetHostSetCount + 1,
    );
  });

  test('saving host source with address brings up confirmation modal and can cancel', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const target = this.server.create('target', {
      scope: instances.scopes.project,
      address: '0.0.0.0',
    });
    const targetHostSetCount = this.server.schema.targets.find(target.id)
      .hostSets.models.length;
    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );

    const targetUrl = `${urls.targets}/${target.id}`;
    await visit(targetUrl);
    await click(`[href="${targetUrl}/host-sources"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_HOSTSOURCE_SELECTOR);

    await click('tbody label');
    await click('form [type="submit"]');

    assert.dom('.rose-dialog').isVisible();
    await click(
      '.rose-dialog-footer .rose-button-secondary',
      'Remove resources',
    );

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.models.length,
      targetHostSetCount,
    );
  });
});
