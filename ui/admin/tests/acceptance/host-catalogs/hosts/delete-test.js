/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | host-catalogs | hosts | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

  test('can delete host', async function (assert) {
    const count = getHostCount();
    await visit(urls.host);

    await click(selectors.MANAGE_DROPDOWN_HOST);
    await click(selectors.MANAGE_DROPDOWN_HOST_DELETE);
    assert.strictEqual(getHostCount(), count - 1);
  });

  test('cannot delete a host without proper authorization', async function (assert) {
    instances.host.authorized_actions =
      instances.host.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.host);

    assert.dom(selectors.MANAGE_DROPDOWN_HOST).doesNotExist();
  });

  test('can accept delete host via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getHostCount();
    await visit(urls.host);

    await click(selectors.MANAGE_DROPDOWN_HOST);
    await click(selectors.MANAGE_DROPDOWN_HOST_DELETE);

    assert.strictEqual(getHostCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete host via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getHostCount();
    await visit(urls.host);

    await click(selectors.MANAGE_DROPDOWN_HOST);
    await click(selectors.MANAGE_DROPDOWN_HOST_DELETE);

    assert.strictEqual(getHostCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a host which errors displays error messages', async function (assert) {
    this.server.del('/hosts/:id', () => {
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
    await visit(urls.host);

    await click(selectors.MANAGE_DROPDOWN_HOST);
    await click(selectors.MANAGE_DROPDOWN_HOST_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
