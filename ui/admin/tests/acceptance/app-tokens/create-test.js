/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | app-tokens | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getAppTokenCount;

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
    getAppTokenCount = () => this.server.schema.appTokens.all().models.length;
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

  test.each(
    'users can create a new app-token',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      const appTokenCount = getAppTokenCount();
      await visit(urls[`${scope}AppTokens`]);

      await click(commonSelectors.HREF(urls[`${scope}NewAppToken`]));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );

      assert.dom(selectors.FIELD_TTL_DAYS).hasValue('60'); // Default value for TTL is 60 days;
      assert.dom(selectors.FIELD_TTL_HOURS).hasValue('0');
      assert.dom(selectors.FIELD_TTL_MINUTES).hasValue('0');

      await click(commonSelectors.SAVE_BTN);
      const appToken = this.server.schema.appTokens.findBy({
        name: commonSelectors.FIELD_NAME_VALUE,
      });

      assert.strictEqual(appToken.name, commonSelectors.FIELD_NAME_VALUE);
      assert.strictEqual(appToken.timeToLiveSeconds, 5184000);
      assert.strictEqual(getAppTokenCount(), appTokenCount + 1);
    },
  );

  test.each(
    'users can cancel a new app-token creation',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      const appTokenCount = getAppTokenCount();
      await visit(urls[`${scope}AppTokens`]);

      await click(commonSelectors.HREF(urls[`${scope}NewAppToken`]));
      await fillIn(
        commonSelectors.FIELD_NAME,
        commonSelectors.FIELD_NAME_VALUE,
      );
      await click(commonSelectors.CANCEL_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppTokens`]);
      assert.strictEqual(getAppTokenCount(), appTokenCount);
    },
  );

  test.each(
    'saving a new app-token with invalid fields displays errors',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      this.server.post('/app-tokens', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {
              request_fields: [
                {
                  name: 'name',
                  description: 'Name is required.',
                },
              ],
            },
          },
        );
      });
      await visit(urls[`${scope}AppTokens`]);

      await click(commonSelectors.HREF(urls[`${scope}NewAppToken`]));
      await click(commonSelectors.SAVE_BTN);

      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('The request was invalid.');
      assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
    },
  );

  test.each(
    'permission flyout opens with label field and helper text',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);

      assert
        .dom(selectors.PERMISSION_FLYOUT)
        .includesText('A brief explanation of what this permission does');
    },
  );

  test.each(
    'permission flyout displays scope options',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);

      assert.dom(selectors.PERMISSION_FLYOUT).includesText('Scope options');
      assert
        .dom(selectors.PERMISSION_FLYOUT)
        .includesText('Select which scopes the permission is applied to');
      assert.dom(selectors.PERMISSION_FLYOUT).includesText('Add this scope');
    },
  );

  test.each(
    'permission flyout displays grants section with default empty grant field',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);

      assert.dom(selectors.PERMISSION_FLYOUT).includesText('Grants');
      assert.dom(selectors.GRANT_FIELD).exists({ count: 1 });
      assert.dom(selectors.GRANT_FIELD).hasValue('');
    },
  );

  test.each(
    'users can add multiple grant fields',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);

      assert.dom(selectors.GRANT_FIELD).exists({ count: 1 });

      await click(selectors.ADD_GRANT_BTN);

      assert.dom(selectors.GRANT_FIELD).exists({ count: 2 });

      await click(selectors.ADD_GRANT_BTN);

      assert.dom(selectors.GRANT_FIELD).exists({ count: 3 });
    },
  );

  test.each(
    'users can enter text in grant fields',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.GRANT_FIELD, 'id=*;type=*;actions=*');

      assert.dom(selectors.GRANT_FIELD).hasValue('id=*;type=*;actions=*');
    },
  );

  test.each(
    'users can remove grant fields',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);
      await click(selectors.ADD_GRANT_BTN);
      await click(selectors.ADD_GRANT_BTN);

      assert.dom(selectors.GRANT_FIELD).exists({ count: 3 });

      await click(`${selectors.GRANT_REMOVE_BTN}:first-of-type`);

      assert.dom(selectors.GRANT_FIELD).exists({ count: 2 });
    },
  );
});
