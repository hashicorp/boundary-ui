/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | app-tokens | list', function (hooks) {
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
  });

  test.each(
    'users can navigate to app tokens with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}Scope`]);

      assert.true(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('list'),
      );
      assert.true(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );

      await click(commonSelectors.HREF(urls[`${scope}AppTokens`]));

      assert.equal(currentURL(), urls[`${scope}AppTokens`]);
    },
  );

  test.each(
    'users cannot navigate to app tokens without either list or create actions',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.scopes[scope].authorized_collection_actions['app-tokens'] = [];

      await visit(urls[`${scope}Scope`]);

      assert.false(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('list'),
      );
      assert.false(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );
      assert
        .dom(commonSelectors.SIDEBAR_NAV_CONTENT)
        .doesNotIncludeText('App Tokens');
    },
  );

  test.each(
    'users can navigate to app tokens with only create action',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.scopes[scope].authorized_collection_actions['app-tokens'] =
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].filter((item) => item !== 'list');
      await visit(urls[`${scope}Scope`]);

      assert.false(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('list'),
      );
      assert.true(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );

      await click(commonSelectors.HREF(urls[`${scope}AppTokens`]));

      assert.equal(currentURL(), urls[`${scope}AppTokens`]);
    },
  );

  test.each(
    'users can navigate to app tokens with only list action',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.scopes[scope].authorized_collection_actions['app-tokens'] =
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].filter((item) => item !== 'create');
      await visit(urls[`${scope}Scope`]);

      assert.true(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('list'),
      );
      assert.false(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );

      await click(commonSelectors.HREF(urls[`${scope}AppTokens`]));

      assert.equal(currentURL(), urls[`${scope}AppTokens`]);
    },
  );
});
