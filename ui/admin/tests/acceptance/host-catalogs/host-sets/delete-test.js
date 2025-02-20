/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | host sets | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getHostSetCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-dropdown-host-sets] button:first-child';
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-dropdown-host-sets] ul li button';

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
    unknownHostSet: null,
    newHostSet: null,
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
    urls.newHostSet = `${urls.hostSets}/new`;
    // Generate resource couner
    getHostSetCount = () => this.server.schema.hostSets.all().models.length;
    await authenticateSession({});
  });

  test('can delete host', async function (assert) {
    const count = getHostSetCount();
    await visit(urls.hostSet);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(getHostSetCount(), count - 1);
  });

  test('can accept delete host set via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getHostSetCount();
    await visit(urls.hostSet);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(getHostSetCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot delete host set without proper authorization', async function (assert) {
    instances.hostSet.authorized_actions =
      instances.hostSet.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.hostSet);
    await click(MANAGE_DROPDOWN_SELECTOR);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger'),
    );
  });

  test('cannot cancel delete host set via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getHostSetCount();
    await visit(urls.hostSet);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(getHostSetCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a host set which errors displays error messages', async function (assert) {
    this.server.del('/host-sets/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });
    await visit(urls.hostSet);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
