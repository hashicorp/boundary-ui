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
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | host-catalogs | host-sets | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getHostSetHostCount;

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
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);

    assert.strictEqual(currentURL(), urls.hostSetHosts);
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count });
  });

  test('can remove a host', async function (assert) {
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: count - 1 });
  });

  test('cannot remove a host without proper authorization', async function (assert) {
    const authorized_actions = instances.hostSet.authorized_actions.filter(
      (item) => item !== 'remove-hosts',
    );
    instances.hostSet.update({ authorized_actions });
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).doesNotExist();
  });

  test('shows error message on host remove error', async function (assert) {
    const count = getHostSetHostCount();
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

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('visiting add hosts', async function (assert) {
    await visit(urls.addHosts);

    assert.strictEqual(currentURL(), urls.addHosts);
  });

  test('can navigate to add hosts with proper authorization', async function (assert) {
    await visit(urls.hostSet);

    await click(selectors.MANAGE_DROPDOWN_HOST_SETS);

    assert.dom(commonSelectors.HREF(urls.addHosts)).isVisible();
  });

  test('cannot navigate to add hosts without proper authorization', async function (assert) {
    const authorized_actions = instances.hostSet.authorized_actions.filter(
      (item) => item !== 'add-hosts',
    );
    instances.hostSet.update({ authorized_actions });
    await visit(urls.hostSet);

    assert.dom(commonSelectors.HREF(urls.addHosts)).doesNotExist();
  });

  test('select and save hosts to add', async function (assert) {
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).doesNotExist();

    await click(selectors.MANAGE_DROPDOWN_HOST_SETS);
    await click(selectors.MANAGE_DROPDOWN_HOST_SETS_ADD_EXISTING_HOST);

    assert.strictEqual(currentURL(), urls.addHosts);
    // Click three times to select, unselect, then reselect (for coverage)
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('select and cancel hosts to add', async function (assert) {
    const count = getHostSetHostCount();
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count });

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: count - 1 });

    await click(selectors.MANAGE_DROPDOWN_HOST_SETS);
    await click(selectors.MANAGE_DROPDOWN_HOST_SETS_ADD_EXISTING_HOST);

    assert.strictEqual(currentURL(), urls.addHosts);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.CANCEL_BTN);
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: count - 1 });
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

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('visiting host creation from a host set', async function (assert) {
    await visit(urls.createAndAddHost);

    assert.strictEqual(currentURL(), urls.createAndAddHost);
  });

  test('create and add host to host set', async function (assert) {
    instances.hostSet.update({ hostIds: [] });
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).doesNotExist();

    await click(selectors.MANAGE_DROPDOWN_HOST_SETS);
    await click(selectors.MANAGE_DROPDOWN_HOST_SETS_CREATE_AND_ADD);

    assert.strictEqual(currentURL(), urls.createAndAddHost);

    await fillIn(commonSelectors.FIELD_NAME, 'Test Name');
    await fillIn(commonSelectors.FIELD_DESCRIPTION, 'description');
    await click(commonSelectors.SAVE_BTN);
    await visit(urls.hostSetHosts);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('create and cancel host add to host set', async function (assert) {
    await visit(urls.createAndAddHost);

    await click(commonSelectors.CANCEL_BTN);

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

    await fillIn(commonSelectors.FIELD_NAME, 'New Host');
    await click(commonSelectors.SAVE_BTN);

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

    await fillIn(commonSelectors.FIELD_NAME, 'New Host');
    await click(commonSelectors.SAVE_BTN);

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
