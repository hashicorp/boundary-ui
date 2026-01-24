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
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
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
    'users can create a new app-token and view token',
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
      await click(selectors.CONFIRM_APP_TOKEN_BTN, 'Confirm creation');

      const appToken = this.server.schema.appTokens.findBy({
        name: commonSelectors.FIELD_NAME_VALUE,
      });

      assert.dom(selectors.TOKEN_COPY_SNIPPET).hasText(appToken.token);

      await click(selectors.CONFIRM_APP_TOKEN_BTN, 'Confirm token saved');

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
      await click(commonSelectors.SAVE_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}NewAppToken`]);

      await click(selectors.CANCEL_MODAL_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}NewAppToken`]);

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
      await click(selectors.CONFIRM_APP_TOKEN_BTN, 'Confirm creation');

      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('The request was invalid.');
      assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText('Name is required.');
    },
  );

  test.each(
    'users can clone an existing active app-token and view token',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken = this.server.create('app-token', {
        scope:
          scope === 'global'
            ? instances.scopes.global
            : scope === 'org'
              ? instances.scopes.org
              : instances.scopes.project,
        status: 'active',
      });
      const appTokenCount = getAppTokenCount();
      await visit(urls[`${scope}AppTokens`]);

      await click(
        commonSelectors.HREF(
          urls[`${scope}AppTokens`] + `/${instances.appToken.id}`,
        ),
      );
      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_CLONE);

      assert.strictEqual(
        currentURL(),
        urls[`${scope}NewAppToken`] + `?cloneAppToken=${instances.appToken.id}`,
      );
      assert
        .dom(commonSelectors.FIELD_NAME)
        .hasValue(`Clone_${instances.appToken.name}`);

      await click(commonSelectors.SAVE_BTN);
      await click(selectors.CONFIRM_APP_TOKEN_BTN, 'Confirm creation');

      const clonedAppToken = this.server.schema.appTokens.findBy({
        name: `Clone_${instances.appToken.name}`,
      });

      console.log('cloned app token ', clonedAppToken);
      console.log('original app token ', instances.appToken);

      assert.dom(selectors.TOKEN_COPY_SNIPPET).hasText(clonedAppToken.token);
      await click(selectors.CONFIRM_APP_TOKEN_BTN, 'Confirm token saved');

      assert.strictEqual(
        clonedAppToken.name,
        `Clone_${instances.appToken.name}`,
      );
      assert.strictEqual(
        clonedAppToken.timeToLiveSeconds,
        instances.appToken.time_to_live_seconds,
      );
      assert.strictEqual(
        clonedAppToken.timeToStaleSeconds,
        instances.appToken.time_to_stale_seconds,
      );
      assert.strictEqual(
        clonedAppToken.permissions.length,
        instances.appToken.permissions.length,
      );
      assert.strictEqual(getAppTokenCount(), appTokenCount + 1);
    },
  );
});
