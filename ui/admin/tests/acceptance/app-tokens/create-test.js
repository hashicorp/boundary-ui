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

      if (scope === 'project') {
        // Project scopes show "Scope" legend and read-only help text
        assert.dom(selectors.PERMISSION_FLYOUT).includesText('Scope');
        assert
          .dom(selectors.PERMISSION_FLYOUT)
          .includesText('The scope where permissions are applied to');
      } else {
        // Global and org scopes show "Scope options" legend and selection help text
        assert.dom(selectors.PERMISSION_FLYOUT).includesText('Scope options');
        assert
          .dom(selectors.PERMISSION_FLYOUT)
          .includesText('Select which scopes the permission is applied to');
        assert.dom(selectors.PERMISSION_FLYOUT).includesText('Add this scope');
      }
    },
  );

  // Permission CRUD tests
  test.each(
    'users can add a permission with a grant',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Test Permission');

      // Select scope based on scope type
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }

      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');
      await click(selectors.FLYOUT_ADD_BTN);

      assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();
      assert.dom(selectors.PERMISSION_TABLE_ROWS).exists({ count: 1 });
    },
  );

  test.each(
    'users can add multiple permissions',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      // Add first permission
      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'First Permission');
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');
      await click(selectors.FLYOUT_ADD_BTN);

      // Add second permission
      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Second Permission');
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=target;actions=read');
      await click(selectors.FLYOUT_ADD_BTN);

      assert.dom(selectors.PERMISSION_TABLE_ROWS).exists({ count: 2 });
    },
  );

  test.each(
    'users can edit an existing permission',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      // Add permission
      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Original Label');
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');
      await click(selectors.FLYOUT_ADD_BTN);

      // Edit permission
      await click(selectors.PERMISSION_EDIT_BTN(1));
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Updated Label');
      await click(selectors.FLYOUT_SAVE_BTN);

      assert.dom(selectors.ROW_LABEL(1)).hasText('Updated Label');
    },
  );

  test.each(
    'users can delete a permission',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      // Add permission
      await click(selectors.ADD_PERMISSION_BTN);
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');
      await click(selectors.FLYOUT_ADD_BTN);

      assert.dom(selectors.PERMISSION_TABLE_ROWS).exists({ count: 1 });

      // Delete permission
      await click(selectors.PERMISSION_DELETE_BTN(1));

      assert.dom(selectors.PERMISSION_TABLE_ROWS).doesNotExist();
    },
  );

  // Grant management tests
  test.each(
    'users can add multiple grants to a permission',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }

      // Fill first grant
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');

      // Add second grant
      await click(selectors.ADD_GRANT_BTN);

      assert.dom(selectors.GRANT_INPUT).exists({ count: 2 });
    },
  );

  test.each(
    'users can remove a grant from a permission',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);

      // Add second grant
      await click(selectors.ADD_GRANT_BTN);
      assert.dom(selectors.GRANT_INPUT).exists({ count: 2 });

      // Remove first grant
      await click(selectors.DELETE_GRANT_BTN);

      assert.dom(selectors.GRANT_INPUT).exists({ count: 1 });
    },
  );

  // Scope options tests
  test('global scope - can toggle this, children, and descendants', async function (assert) {
    await visit(urls.globalNewAppToken);

    await click(selectors.ADD_PERMISSION_BTN);

    assert.dom(selectors.SCOPE_THIS_TOGGLE).exists();
    assert.dom(selectors.SCOPE_CHILDREN_TOGGLE).exists();
    assert.dom(selectors.SCOPE_DESCENDANTS_TOGGLE).exists();

    await click(selectors.SCOPE_THIS_TOGGLE);
    assert.dom(selectors.SCOPE_THIS_TOGGLE).isChecked();

    await click(selectors.SCOPE_CHILDREN_TOGGLE);
    assert.dom(selectors.SCOPE_CHILDREN_TOGGLE).isChecked();

    await click(selectors.SCOPE_DESCENDANTS_TOGGLE);
    assert.dom(selectors.SCOPE_DESCENDANTS_TOGGLE).isChecked();
  });

  test('org scope - can toggle this and children, descendants not visible', async function (assert) {
    await visit(urls.orgNewAppToken);

    await click(selectors.ADD_PERMISSION_BTN);

    assert.dom(selectors.SCOPE_THIS_TOGGLE).exists();
    assert.dom(selectors.SCOPE_CHILDREN_TOGGLE).exists();
    assert.dom(selectors.SCOPE_DESCENDANTS_TOGGLE).doesNotExist();

    await click(selectors.SCOPE_THIS_TOGGLE);
    assert.dom(selectors.SCOPE_THIS_TOGGLE).isChecked();

    await click(selectors.SCOPE_CHILDREN_TOGGLE);
    assert.dom(selectors.SCOPE_CHILDREN_TOGGLE).isChecked();
  });

  test('project scope - scope is set with no toggles', async function (assert) {
    await visit(urls.projectNewAppToken);

    await click(selectors.ADD_PERMISSION_BTN);

    assert.dom(selectors.SCOPE_THIS_TOGGLE).doesNotExist();
    assert.dom(selectors.SCOPE_CHILDREN_TOGGLE).doesNotExist();
    assert.dom(selectors.SCOPE_DESCENDANTS_TOGGLE).doesNotExist();
    assert.dom(selectors.PERMISSION_FLYOUT).includesText('Project');
  });

  // Cancel operations tests
  test.each(
    'canceling permission addition does not add to list',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Test Permission');
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');

      await click(selectors.FLYOUT_CANCEL_BTN);

      assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();
      assert.dom(selectors.PERMISSION_TABLE_ROWS).doesNotExist();
    },
  );

  test.each(
    'canceling permission after edit will discard changes',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      await visit(urls[`${scope}NewAppToken`]);

      // Add permission
      await click(selectors.ADD_PERMISSION_BTN);
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Original Label');
      if (scope !== 'project') {
        await click(selectors.SCOPE_THIS_TOGGLE);
      }
      await fillIn(selectors.GRANT_INPUT, 'ids=*;type=host;actions=read');
      await click(selectors.FLYOUT_ADD_BTN);

      // Edit and cancel
      await click(selectors.PERMISSION_EDIT_BTN(1));
      await fillIn(selectors.PERMISSION_LABEL_FIELD, 'Changed Label');
      await click(selectors.FLYOUT_CANCEL_BTN);

      assert.dom(selectors.ROW_LABEL(1)).hasText('Original Label');
    },
  );
});
