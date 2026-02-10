/**
 * Copyright IBM Corp. 2021, 2026
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
import { setupApplicationTest } from 'desktop/tests/helpers';
import {
  authenticateSession,
  currentSession,
} from 'ember-simple-auth/test-support';
import { setupBoundaryApiMock } from '../../../helpers/boundary-api-mock';
import setupStubs from 'api/test-support/handlers/cache-daemon-search';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import {
  RDP_CLIENT_MSTSC_LINK,
  RDP_CLIENT_MSTSC,
  RDP_CLIENT_NONE,
  RDP_CLIENT_WINDOWS_APP,
} from 'desktop/services/rdp';
import sinon from 'sinon';

module('Acceptance | projects | settings | index', function (hooks) {
  setupApplicationTest(hooks);
  setupBoundaryApiMock(hooks);
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
    account: null,
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
  const RDP_PREFERRED_CLIENT = '[data-test-select-preferred-rdp-client]';
  const RDP_RECOMMENDED_CLIENT = '[data-test-recommended-rdp-client]';
  const RDP_RECOMMENDED_CLIENT_LINK = '[data-test-recommended-rdp-client] a';

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(async function () {
    // Generate scopes
    instances.scopes.global = this.server.schema.scopes.find('global');
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
    instances.account = this.server.schema.accounts.first();
    urls.scopes.org = `/scopes/${instances.scopes.org.id}`;
    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.projects = `${urls.scopes.org}/projects`;
    urls.settings = `${urls.projects}/settings`;

    setDefaultClusterUrl(this);

    // mock RDP client data
    window.boundary.getRdpClients = () => [RDP_CLIENT_MSTSC, RDP_CLIENT_NONE];
    window.boundary.getPreferredRdpClient = () => RDP_CLIENT_MSTSC;
    window.boundary.checkOS = () => ({ isWindows: true, isMac: false });
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

    await authenticateSession({ account_id: instances.account.id });
    assert.expect(2);

    await authenticateSession({ account_id: instances.account.id });
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

    const stopAllSessions = sinon.stub(window.boundary, 'stopAllSessions');
    window.boundary.hasRunningSessions = () => true;

    await authenticateSession({ account_id: instances.account.id });
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

  test('preferred RDP client is selected correctly for Windows', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-02
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2026-02-02
          enabled: false,
        },
      },
    });

    await visit(urls.settings);

    assert.dom(RDP_PREFERRED_CLIENT).isVisible().hasValue(RDP_CLIENT_MSTSC);
  });

  test('preferred RDP client is selected correctly for Mac', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-02
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2026-02-02
          enabled: false,
        },
      },
    });

    // update window bounday mock fo mac
    window.boundary.checkOS = () => ({ isWindows: false, isMac: true });
    window.boundary.getRdpClients = () => [
      RDP_CLIENT_WINDOWS_APP,
      RDP_CLIENT_NONE,
    ];
    window.boundary.getPreferredRdpClient = () => RDP_CLIENT_WINDOWS_APP;
    await visit(urls.settings);

    assert
      .dom(RDP_PREFERRED_CLIENT)
      .isVisible()
      .hasValue(RDP_CLIENT_WINDOWS_APP);
  });

  test('recommended RDP client is shown when no RDP clients are detected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-02
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2026-02-02
          enabled: false,
        },
      },
    });

    // update window boundary mock for no RDP clients
    window.boundary.getRdpClients = () => [RDP_CLIENT_NONE];
    window.boundary.getPreferredRdpClient = () => RDP_CLIENT_NONE;
    await visit(urls.settings);

    assert.dom(RDP_RECOMMENDED_CLIENT).isVisible();
    assert
      .dom(RDP_RECOMMENDED_CLIENT_LINK)
      .hasAttribute('href', RDP_CLIENT_MSTSC_LINK)
      .hasText('Remote Desktop Connection (mstsc)');
  });

  test('preferred RDP client is updated correctly', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-02
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2026-02-02
          enabled: false,
        },
      },
    });

    const rdpService = this.owner.lookup('service:rdp');
    const setPreferredRdpClientStub = sinon
      .stub(window.boundary, 'setPreferredRdpClient')
      .resolves();
    await visit(urls.settings);
    await visit(urls.settings);

    await select(RDP_PREFERRED_CLIENT, RDP_CLIENT_NONE);

    assert.ok(setPreferredRdpClientStub.calledWith(RDP_CLIENT_NONE));
    assert.strictEqual(rdpService.preferredRdpClient, RDP_CLIENT_NONE);
  });
});
