/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  find,
  findAll,
  fillIn,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | host-sets | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getHostSetHostCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-dropdown-host-sets] button:first-child';
  const CREATE_AND_ADD_HOSTS_SELECTOR =
    '[data-test-manage-dropdown-host-sets] div ul li:first-child a';
  const ADD_EXISTING_HOSTS_SELECTOR =
    '[data-test-manage-dropdown-host-sets] div ul li:nth-child(2) a';

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
    hostSets: null,
    hostSet: null,
    hostSetHosts: null,
    addHosts: null,
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
    instances.hostCatalog = this.server.create(
      'host-catalog',
      {
        scope: instances.scopes.project,
      },
      'withChildren',
    );
    instances.hostSet = this.server.schema.hostSets.all().models[0];
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.hostSetHosts = `${urls.hostSet}/hosts`;
    urls.addHosts = `${urls.hostSet}/add-hosts`;
    urls.createAndAddHost = `${urls.hostSet}/create-and-add-host`;
    // Generate resource counter
    getHostSetHostCount = () =>
      this.server.schema.hostSets.all().models[0].hosts.length;
    await authenticateSession({ username: 'admin' });
  });

  test('visiting host set hosts', async function (assert) {
    await visit(urls.hostSetHosts);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, getHostSetHostCount());
  });

  test('can remove a host', async function (assert) {
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, count);

    await click('[data-test-host-set-hosts-dropdown-toggle]');
    await click('[data-test-host-set-hosts-dropdown-remove-host]');
    assert.strictEqual(findAll('tbody tr').length, count - 1);
  });

  test('cannot remove a host without proper authorization', async function (assert) {
    const authorized_actions = instances.hostSet.authorized_actions.filter(
      (item) => item !== 'remove-hosts',
    );
    instances.hostSet.update({ authorized_actions });
    await visit(urls.hostSetHosts);
    assert.notOk(
      find('tbody tr [data-test-host-set-hosts-dropdown-remove-host]'),
    );
  });

  test('shows error message on host remove error', async function (assert) {
    this.server.post('/host-sets/:idMethod', () => {
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
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, getHostSetHostCount());
    await click('[data-test-host-set-hosts-dropdown-toggle]');
    await click('[data-test-host-set-hosts-dropdown-remove-host]');
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('visiting add hosts', async function (assert) {
    await visit(urls.addHosts);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.addHosts);
  });

  test('can navigate to add hosts with proper authorization', async function (assert) {
    await visit(urls.hostSet);
    await click(MANAGE_DROPDOWN_SELECTOR);
    assert.ok(find(`[href="${urls.addHosts}"]`));
  });

  test('cannot navigate to add hosts without proper authorization', async function (assert) {
    const authorized_actions = instances.hostSet.authorized_actions.filter(
      (item) => item !== 'add-hosts',
    );
    instances.hostSet.update({ authorized_actions });
    await visit(urls.hostSet);
    assert.notOk(find(`[href="${urls.addHosts}"]`));
  });

  test('select and save hosts to add', async function (assert) {
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_EXISTING_HOSTS_SELECTOR);
    assert.strictEqual(currentURL(), urls.addHosts);
    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('select and cancel hosts to add', async function (assert) {
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, count);
    await click('[data-test-host-set-hosts-dropdown-toggle]');
    await click('[data-test-host-set-hosts-dropdown-remove-host]');
    assert.strictEqual(findAll('tbody tr').length, count - 1);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(ADD_EXISTING_HOSTS_SELECTOR);
    assert.strictEqual(currentURL(), urls.addHosts);
    await click('tbody .hds-table__tr .hds-form-label');
    await click('form [type="button"]');
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, count - 1);
  });

  test('shows error message on host add error', async function (assert) {
    this.server.post('/host-sets/:idMethod', () => {
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
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.addHosts);
    await click('tbody .hds-table__tr .hds-form-label');
    await click('form [type="submit"]');
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('visiting host creation from a host set', async function (assert) {
    await visit(urls.createAndAddHost);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.createAndAddHost);
  });

  test('create and add host to host set', async function (assert) {
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.hostSet);
    assert.strictEqual(findAll('tbody tr').length, 0);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(CREATE_AND_ADD_HOSTS_SELECTOR);
    assert.strictEqual(currentURL(), urls.createAndAddHost);
    await fillIn('[name="name"]', 'Test Name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    await visit(urls.hostSetHosts);
    assert.strictEqual(findAll('tbody tr').length, 1);
  });

  test('create and cancel host add to host set', async function (assert) {
    await visit(urls.createAndAddHost);
    await click('form [type="button"]');
    assert.strictEqual(currentURL(), urls.hostSetHosts);
  });

  test('shows error message on host creation error', async function (assert) {
    this.server.post('/hosts', () => {
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
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.createAndAddHost);
    await fillIn('[name="name"]', 'New Host');
    await click('form [type="submit"]');
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('shows error message on host addition to host set error', async function (assert) {
    this.server.post('/host-sets/:idMethod', () => {
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
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.createAndAddHost);
    await fillIn('[name="name"]', 'New Host');
    await click('form [type="submit"]');
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('users can navigate to host and incorrect url autocorrects', async function (assert) {
    const hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
      type: 'plugin',
      plugin: { name: 'aws' },
    });
    const hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog,
    });
    const host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog,
      hostSetIds: [hostSet.id],
    });
    const incorrectUrl = `${urls.hostCatalogs}/${hostCatalog.id}/host-sets/${instances.hostSet.id}/hosts/${host.id}`;
    const correctUrl = `${urls.hostCatalogs}/${hostCatalog.id}/host-sets/${hostSet.id}/hosts/${host.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
