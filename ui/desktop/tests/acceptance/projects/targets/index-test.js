/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import sinon from 'sinon';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import {
  authenticateSession,
  invalidateSession,
  currentSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | projects | targets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;

  const ROSE_APP_STATE_TITLE = '.rose-message-title';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethods: {
      global: null,
    },
    target: null,
    session: null,
  };

  const stubs = {
    global: null,
    org: null,
    ipcService: null,
  };

  const urls = {
    scopes: {
      global: null,
      org: null,
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    targets: null,
    target: null,
    sessions: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(function () {
    authenticateSession();

    // Generate scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    stubs.global = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: stubs.global,
    });
    stubs.org = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: stubs.org,
    });
    stubs.project = { id: instances.scopes.project.id, type: 'project' };

    // Generate resources
    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });
    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren'
    );
    instances.target = this.server.create(
      'target',
      {
        scope: instances.scopes.project,
        address: '127.0.0.1',
      },
      'withAssociations'
    );
    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations'
    );

    // Generate route URLs for resources
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;

    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  test('visiting index while unauthenticated redirects to global authenticate method', async function (assert) {
    invalidateSession();
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });

  test('visiting targets index', async function (assert) {
    assert.expect(2);
    const targetsCount = getTargetCount();
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetsCount);
  });

  test('visiting a target', async function (assert) {
    assert.expect(2);
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom(`[data-test-visit-target="${instances.target.id}"]`).exists();

    await click(`[href="${urls.target}"]`);

    assert.strictEqual(currentURL(), urls.target);
  });

  test('visiting targets list view with no targets', async function (assert) {
    assert.expect(1);
    this.server.get('/targets', () => new Response(200));
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.dom(ROSE_APP_STATE_TITLE).hasText('No Targets Available');
  });

  test('cannot navigate to a target without proper authorization', async function (assert) {
    assert.expect(1);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(`[data-test-visit-target="${instances.target.id}"]`)
      .doesNotExist();
  });

  test('can connect to a target with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.true(
      instances.target.authorized_actions.includes('authorize-session')
    );
    assert
      .dom(`[data-test-targets-connect-button="${instances.target.id}"]`)
      .exists();
  });

  test('cannot connect to a target without proper authorization', async function (assert) {
    assert.expect(2);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'authorize-session'
      );
    await visit(urls.projects);

    await click(`[href="${urls.targets}"]`);

    assert.false(
      instances.target.authorized_actions.includes('authorize-session')
    );
    assert
      .dom(`[data-test-targets-connect-button="${instances.target.id}"]`)
      .doesNotExist();
  });
});
