/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { STATUS_APP_TOKEN_ACTIVE } from 'api/models/app-token';

module('Acceptance | app-tokens | clone', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getAppTokenCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    appToken: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    globalAppToken: null,
    orgAppToken: null,
    projectAppToken: null,
    globalCloneAppToken: null,
    orgCloneAppToken: null,
    projectCloneAppToken: null,
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
    instances.appToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Test App Token',
      description: 'Test token description',
      status: STATUS_APP_TOKEN_ACTIVE,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.globalAppToken = `${urls.globalScope}/app-tokens/${instances.appToken.id}`;
    urls.orgAppToken = `${urls.orgScope}/app-tokens/${instances.appToken.id}`;
    urls.projectAppToken = `${urls.projectScope}/app-tokens/${instances.appToken.id}`;
    urls.globalCloneAppToken = `${urls.globalScope}/app-tokens/new?cloneAppToken=${instances.appToken?.id}`;
    urls.orgCloneAppToken = `${urls.orgScope}/app-tokens/new?cloneAppToken=${instances.appToken?.id}`;
    urls.projectCloneAppToken = `${urls.projectScope}/app-tokens/new?cloneAppToken=${instances.appToken?.id}`;

    getAppTokenCount = () => this.server.schema.appTokens.all().models.length;
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
  });

  test.each(
    'users can clone an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-20
            enabled: false,
          },
        },
      });
      instances.appToken.update({ scope: instances.scopes[scope] });

      assert.true(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );
      assert.true(instances.appToken.authorized_actions.includes('read'));
      assert.true(instances.appToken.authorized_actions.includes('read:self'));

      await visit(urls[`${scope}AppToken`]);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_CLONE);

      assert.strictEqual(currentURL(), urls[`${scope}CloneAppToken`]);
    },
  );

  test.each(
    'users cannot clone an app-token without proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
            enabled: false,
          },
        },
      });
      instances.scopes[scope].authorized_collection_actions['app-tokens'] =
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].filter((item) => item !== 'create');
      instances.appToken.authorized_actions =
        instances.appToken.authorized_actions.filter(
          (item) => item !== 'read' && item !== 'read:self',
        );

      assert.false(
        instances.scopes[scope].authorized_collection_actions[
          'app-tokens'
        ].includes('create'),
      );
      assert.false(instances.appToken.authorized_actions.includes('read'));
      assert.false(instances.appToken.authorized_actions.includes('read:self'));

      await visit(urls[`${scope}AppToken`]);

      await click(selectors.MANAGE_DROPDOWN);

      assert.dom(selectors.MANAGE_DROPDOWN_CLONE).doesNotExist();
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
    },
  );

  test.each(
    'users can clone an existing active app-token and view token',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-01-15
            enabled: false,
          },
        },
      });
      instances.appToken.update({ scope: instances.scopes[scope] });
      const appTokenCount = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_CLONE);

      assert.strictEqual(currentURL(), urls[`${scope}CloneAppToken`]);
      assert
        .dom(commonSelectors.FIELD_NAME)
        .hasValue(`Clone_${instances.appToken.name}`);

      await click(commonSelectors.SAVE_BTN);
      await click(selectors.CONFIRM_APP_TOKEN_BTN, 'Confirm creation');

      const clonedAppToken = this.server.schema.appTokens.findBy({
        name: `Clone_${instances.appToken.name}`,
      });

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
