/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | app tokens/create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    globalAppTokens: null,
    orgAppTokens: null,
    projectAppTokens: null,
    globalNewAppToken: null,
    orgNewAppToken: null,
    projectNewAppToken: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.globalAppTokens = `${urls.globalScope}/app-tokens`;
    urls.orgAppTokens = `${urls.orgScope}/app-tokens`;
    urls.projectAppTokens = `${urls.projectScope}/app-tokens`;
    urls.globalNewAppToken = `${urls.globalScope}/app-tokens/new`;
    urls.orgNewAppToken = `${urls.orgScope}/app-tokens/new`;
    urls.projectNewAppToken = `${urls.projectScope}/app-tokens/new`;
  });

  test.each(
    'can navigate to new app-token route with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}Scope`]);

      await click(commonSelectors.HREF(urls[`${scope}AppTokens`]));

      assert.true(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );
      assert.dom(commonSelectors.HREF(urls[`${scope}NewAppToken`])).isVisible();
    },
  );

  test.each(
    'users cannot directly navigate to new app-token route without proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.scopes[scope].authorized_collection_actions['app-tokens'] =
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].filter((item) => item !== 'create');

      await visit(urls[`${scope}NewAppToken`]);

      assert.false(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );
      assert.strictEqual(currentURL(), urls[`${scope}AppTokens`]);
    },
  );
});
