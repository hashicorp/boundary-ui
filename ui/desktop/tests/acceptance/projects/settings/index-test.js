/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  currentURL,
  click,
  visit,
  getRootElement,
  select,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  currentSession,
} from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../../helpers/window-mock-ipc';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';
import { STATUS_SESSION_ACTIVE } from 'api/models/session';

const SIGNOUT_SELECTOR = '[data-test-signout-button]';

module('Acceptance | projects | settings | index', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupStubs(hooks);

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
    target2: null,
    session: null,
    user: null,
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
    settings: null,
    session: null,
    target: null,
  };

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    instances.user = this.server.create('user', {
      scope: instances.scopes.global,
    });
    await authenticateSession();
    // Generate scopes
    instances.scopes.global = this.server.create('scope', {
      id: 'global',
      name: 'Global',
    });
    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });

    const globalScope = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: globalScope,
    });
    const orgScope = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: orgScope,
    });
    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren',
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
    instances.session = this.server.create(
      'session',
      {
        scope: instances.scopes.project,
        target: instances.target,
        status: STATUS_SESSION_ACTIVE,
        user: instances.user,
      },
      'withAssociations',
    );
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.targets = `${urls.projects}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.settings = `${urls.projects}/settings`;
    urls.sessions = `${urls.projects}/sessions`;
    urls.session = `${urls.sessions}/${instances.session.id}`;

    this.owner.register('service:browser/window', WindowMockIPC);
    setDefaultClusterUrl(this);

    this.ipcStub
      .withArgs('getDesktopVersion')
      .returns({ desktopVersion: '0.1.0' });
    this.ipcStub
      .withArgs('getCliVersion')
      .returns({ versionNumber: 'Boundary CLI v0.1.0' });
    this.ipcStub
      .withArgs('cacheDaemonStatus')
      .returns({ version: 'Boundary CLI v0.1.0' });
  });

  test('can navigate to the settings page', async function (assert) {
    await visit(urls.projects);
    await click(`[href="${urls.settings}"]`);
    assert.strictEqual(currentURL(), urls.settings);
  });

  test('color theme is applied from session data', async function (assert) {
    await visit(urls.settings);

    // system default
    assert.notOk(currentSession().get('data.theme'));
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle light mode
    await select('[name="theme"]', 'light');
    assert.strictEqual(currentSession().get('data.theme'), 'light');
    assert.ok(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle dark mode
    await select('[name="theme"]', 'dark');
    assert.strictEqual(currentSession().get('data.theme'), 'dark');
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.ok(getRootElement().classList.contains('rose-theme-dark'));
    // toggle system default
    await select('[name="theme"]', 'system-default-theme');
    assert.strictEqual(
      currentSession().get('data.theme'),
      'system-default-theme',
    );
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
  });

  test('clicking sign-out button logs out the user', async function (assert) {
    await authenticateSession({ username: 'testuser' });
    assert.expect(2);
    await visit(urls.settings);
    assert.ok(currentSession().isAuthenticated);
    await click(SIGNOUT_SELECTOR);
    assert.notOk(currentSession().isAuthenticated);
  });
});
