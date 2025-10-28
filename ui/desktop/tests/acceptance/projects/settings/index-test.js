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
import { setRunOptions } from 'ember-a11y-testing/test-support';
import sinon from 'sinon';

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
  };

  const SIGNOUT_BTN = '[data-test-settings-signout-btn]';
  const MODAL_CLOSE_SESSIONS = '[data-test-close-sessions-modal]';
  const MODAL_CONFIRM_BTN = '.hds-modal__footer .hds-button--color-primary';

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    await authenticateSession();

    // Generate scopes
    instances.scopes.global = this.server.create('scope', {
      id: 'global',
      name: 'Global',
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
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.settings = `${urls.projects}/settings`;

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

    // mock RDP service calls
    let rdpService = this.owner.lookup('service:rdp');
    sinon.stub(rdpService, 'getRdpClients').resolves();
    sinon.stub(rdpService, 'getPreferredRdpClient').resolves();
  });

  test('can navigate to the settings page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projects);
    await click(`[href="${urls.settings}"]`);
    assert.strictEqual(currentURL(), urls.settings);
  });

  test('color theme is applied from session data', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

  test('clicking signout button logs out the user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await authenticateSession({ username: 'testuser' });
    assert.expect(2);

    await authenticateSession({ username: 'testuser' });
    assert.ok(currentSession().isAuthenticated);

    await visit(urls.settings);

    await click(SIGNOUT_BTN);

    assert.notOk(currentSession().isAuthenticated);
  });

  test('confirming signout with running sessions stops sessions and logs out user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-19
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-19
          enabled: false,
        },
      },
    });

    const stopAllSessions = this.ipcStub.withArgs('stopAll');
    this.ipcStub.withArgs('hasRunningSessions').returns(true);

    await authenticateSession({ username: 'testuser' });
    assert.ok(currentSession().isAuthenticated);

    await visit(urls.settings);

    await click(SIGNOUT_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isVisible();
    assert.dom(MODAL_CLOSE_SESSIONS).includesText('Sign out of Boundary?');

    await click(MODAL_CONFIRM_BTN);

    assert.dom(MODAL_CLOSE_SESSIONS).isNotVisible();
    assert.ok(stopAllSessions.calledOnce);
    assert.notOk(currentSession().isAuthenticated);
  });
});
