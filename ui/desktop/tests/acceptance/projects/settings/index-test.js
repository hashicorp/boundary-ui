/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import WindowMockIPC from '../../../helpers/window-mock-ipc';

module('Acceptance | projects | settings | index', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

  const setDefaultClusterUrl = (test) => {
    const windowOrigin = window.location.origin;
    const clusterUrl = test.owner.lookup('service:clusterUrl');
    clusterUrl.rendererClusterUrl = windowOrigin;
  };

  hooks.beforeEach(function () {
    authenticateSession();
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
  });

  test('can navigate to the settings page', async function (assert) {
    await visit(urls.projects);
    await click(`[href="${urls.settings}"]`);
    assert.strictEqual(currentURL(), urls.settings);
  });
});
