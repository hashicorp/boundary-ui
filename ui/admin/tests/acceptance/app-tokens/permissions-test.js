/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | app-tokens | permissions', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks, 'en-us');

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    appToken: null,
    appTokenWithNoActiveScopes: null,
    appTokenWithMixedScopes: null,
  };

  const urls = {
    appTokens: null,
    appToken: null,
    appTokenPermissions: null,
    appTokenWithNoActiveScopes: null,
    appTokenWithMixedScopes: null,
  };

  const hostCatalogGrant = 'type=host-catalog;actions=list';
  const userGrant = 'type=user;actions=read';

  const permissionWithActiveScopes = {
    grant: [hostCatalogGrant],
    grant_scopes: ['this', 'p_123456'],
    deleted_scopes: [],
  };

  const anotherPermission = {
    label: 'Another Permission',
    grant: [hostCatalogGrant, userGrant],
    grant_scopes: ['this', 'children', 'p_654321'],
    deleted_scopes: [],
  };

  const permissionWithNoActiveScopes = {
    grant: [hostCatalogGrant],
    grant_scopes: [],
    deleted_scopes: [
      {
        scope_id: 'p_123456',
        deleted_at: '2025-06-14T13:37:56Z',
      },
    ],
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.appToken = this.server.create('app-token', {
      scope: instances.scopes.org,
      name: 'Test App Token',
      description: 'Test token description',
      status: 'active',
      permissions: [permissionWithActiveScopes, anotherPermission],
    });
    instances.appTokenWithNoActiveScopes = this.server.create('app-token', {
      scope: instances.scopes.org,
      name: 'App Token No Active Scopes',
      description: 'Test token with no active scopes',
      status: 'active',
      permissions: [permissionWithNoActiveScopes],
    });
    instances.appTokenWithMixedScopes = this.server.create('app-token', {
      scope: instances.scopes.org,
      name: 'App Token Mixed Scopes',
      description: 'Test token with mixed scopes',
      status: 'active',
      permissions: [permissionWithNoActiveScopes, permissionWithActiveScopes],
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.appTokens = `${urls.orgScope}/app-tokens`;
    urls.appToken = `${urls.appTokens}/${instances.appToken.id}`;
    urls.appTokenPermissions = `${urls.appToken}/permissions`;
    urls.appTokenWithNoActiveScopes = `${urls.appTokens}/${instances.appTokenWithNoActiveScopes.id}/permissions`;
    urls.appTokenWithMixedScopes = `${urls.appTokens}/${instances.appTokenWithMixedScopes.id}/permissions`;
  });

  test('visiting an app token permissions page', async function (assert) {
    await visit(urls.appToken);
    await click(commonSelectors.HREF(urls.appTokenPermissions));

    assert.strictEqual(currentURL(), urls.appTokenPermissions);
    assert.dom('table').exists('Permissions table is displayed');
  });

  test('app token permissions page displays breadcrumbs', async function (assert) {
    await visit(urls.appTokenPermissions);

    assert.dom(selectors.BREADCRUMB).containsText('Permissions');
  });

  test('app token permissions shows permission label and count for grants, scopes, and deleted scopes', async function (assert) {
    await visit(urls.appTokenPermissions);

    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 2 });

    assert.dom(selectors.ROW_LABEL(1)).containsText('—');
    assert.dom(selectors.ROW_GRANTS(1)).containsText('1');
    assert.dom(selectors.ROW_ACTIVE_SCOPES(1)).containsText('2');
    assert.dom(selectors.ROW_DELETED_SCOPES(1)).containsText('—');

    assert.dom(selectors.ROW_LABEL(2)).containsText('Another Permission');
    assert.dom(selectors.ROW_GRANTS(2)).containsText('2');
    assert.dom(selectors.ROW_ACTIVE_SCOPES(2)).containsText('3');
    assert.dom(selectors.ROW_DELETED_SCOPES(2)).containsText('—');
  });

  test.each(
    'app token permissions shows "no active scopes" alert when at least one permission has no active scopes',
    {
      noActiveScopes: {
        url: 'appTokenWithNoActiveScopes',
        isShown: true,
      },
      mixedActiveScopes: {
        url: 'appTokenWithMixedScopes',
        isShown: true,
      },
      activeScopes: {
        url: 'appTokenPermissions',
        isShown: false,
      },
    },
    async function (assert, { url, isShown }) {
      await visit(urls[url]);

      if (isShown) {
        assert
          .dom('[data-test-permissions-alert]')
          .isVisible('Displays warning for permissions with no active scopes');
      } else {
        assert
          .dom('[data-test-permissions-alert]')
          .doesNotExist(
            'No warning displayed when all permissions have active scopes',
          );
      }
    },
  );

  test('clicking grants count opens grants flyout', async function (assert) {
    await visit(urls.appTokenPermissions);

    assert.dom(selectors.GRANTS_FLYOUT).doesNotExist();

    await click(selectors.GRANTS_BTN(1));

    assert.dom(selectors.GRANTS_FLYOUT).isVisible();
    assert.dom(selectors.FLYOUT_HEADER).containsText('Grants');
    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 1 });
  });

  test('grants flyout displays multiple grants', async function (assert) {
    await visit(urls.appTokenPermissions);

    await click(selectors.GRANTS_BTN(2));

    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 2 });
    assert.dom(selectors.GRANTS_FLYOUT).containsText(hostCatalogGrant);
    assert.dom(selectors.GRANTS_FLYOUT).containsText(userGrant);
  });

  test('clicking active scopes count opens active scopes flyout', async function (assert) {
    await visit(urls.appTokenPermissions);

    assert.dom(selectors.ACTIVE_SCOPES_FLYOUT).doesNotExist();

    await click(selectors.ACTIVE_SCOPES_BTN(1));

    assert.dom(selectors.ACTIVE_SCOPES_FLYOUT).isVisible();
    assert.dom(selectors.FLYOUT_HEADER).containsText('Active scopes');
    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 2 });
  });

  test('active scopes flyout displays keyword scopes correctly', async function (assert) {
    await visit(urls.appTokenPermissions);

    await click(selectors.ACTIVE_SCOPES_BTN(2));

    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 3 });
    // 'this' keyword should display the current scope name (org name)
    assert
      .dom(selectors.FLYOUT_TABLE_SCOPE_NAME(1))
      .containsText(instances.scopes.org.name);
    // 'children' keyword should display as em dash
    assert.dom(selectors.FLYOUT_TABLE_SCOPE_NAME(2)).containsText('—');
  });

  test('active scopes flyout shows link for "this" keyword scope', async function (assert) {
    await visit(urls.appTokenPermissions);

    await click(selectors.ACTIVE_SCOPES_BTN(1));

    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 2 });
    // 'this' keyword should have a link to the current scope
    assert
      .dom(selectors.FLYOUT_TABLE_SCOPE_LINK(1))
      .hasAttribute('href', urls.orgScope);
  });

  test('clicking deleted scopes count opens deleted scopes flyout', async function (assert) {
    await visit(urls.appTokenWithNoActiveScopes);

    assert.dom(selectors.DELETED_SCOPES_FLYOUT).doesNotExist();

    await click(selectors.DELETED_SCOPES_BTN(1));

    assert.dom(selectors.DELETED_SCOPES_FLYOUT).isVisible();
    assert.dom(selectors.FLYOUT_HEADER).containsText('Deleted scopes');
    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 1 });
  });

  test('deleted scopes flyout displays scope ID and deleted time', async function (assert) {
    await visit(urls.appTokenWithNoActiveScopes);

    await click(selectors.DELETED_SCOPES_BTN(1));

    assert.dom(selectors.FLYOUT_TABLE_ROWS).exists({ count: 1 });
    assert.dom(selectors.DELETED_SCOPES_FLYOUT).containsText('p_123456');
    assert.dom('.hds-flyout .hds-time').isVisible();
  });

  test.each(
    'closing flyout hides it',
    {
      grants: {
        url: 'appTokenPermissions',
        openBtn: selectors.GRANTS_BTN(1),
        flyout: selectors.GRANTS_FLYOUT,
      },
      activeScopes: {
        url: 'appTokenPermissions',
        openBtn: selectors.ACTIVE_SCOPES_BTN(1),
        flyout: selectors.ACTIVE_SCOPES_FLYOUT,
      },
      deletedScopes: {
        url: 'appTokenWithNoActiveScopes',
        openBtn: selectors.DELETED_SCOPES_BTN(1),
        flyout: selectors.DELETED_SCOPES_FLYOUT,
      },
    },
    async function (assert, { url, openBtn, flyout }) {
      await visit(urls[url]);
      await click(openBtn);

      assert.dom(flyout).isVisible();

      await click(selectors.FLYOUT_CLOSE_BTN);

      assert.dom(flyout).doesNotExist();
    },
  );

  // Clone and delete button tests for no-active-scopes alert
  test('no-active-scopes alert displays clone and delete buttons', async function (assert) {
    await visit(urls.appTokenWithNoActiveScopes);

    assert.dom(selectors.INACTIVE_ALERT).isVisible();
    assert.dom(selectors.INLINE_CLONE_BTN).isVisible();
    assert.dom(selectors.INLINE_DELETE_BTN).isVisible();
  });

  test('clicking clone button in no-active-scopes alert navigates to new app token page', async function (assert) {
    await visit(urls.appTokenWithNoActiveScopes);
    await click(selectors.INLINE_CLONE_BTN);

    assert.strictEqual(
      currentURL(),
      `${urls.appTokens}/new?cloneAppToken=${instances.appTokenWithNoActiveScopes.id}`,
    );
  });

  test('clicking delete button in no-active-scopes alert opens delete modal', async function (assert) {
    await visit(urls.appTokenWithNoActiveScopes);
    await click(selectors.INLINE_DELETE_BTN);

    assert.dom(selectors.DELETE_MODAL).isVisible();
  });

  test('users can delete app token via inline delete button on permissions page', async function (assert) {
    const count = this.server.schema.appTokens.all().models.length;

    await visit(urls.appTokenWithNoActiveScopes);
    await click(selectors.INLINE_DELETE_BTN);
    await fillIn(selectors.FILED_CONFIRM_DELETE, 'DELETE');
    await click(selectors.CONFIRM_DELETE_BTN);

    assert.strictEqual(currentURL(), urls.appTokens);
    assert.strictEqual(
      this.server.schema.appTokens.all().models.length,
      count - 1,
    );
  });

  test('users can cancel delete action from inline delete button on permissions page', async function (assert) {
    const count = this.server.schema.appTokens.all().models.length;

    await visit(urls.appTokenWithNoActiveScopes);
    await click(selectors.INLINE_DELETE_BTN);
    await click(selectors.CANCEL_MODAL_BTN);

    assert.strictEqual(currentURL(), urls.appTokenWithNoActiveScopes);
    assert.strictEqual(this.server.schema.appTokens.all().models.length, count);
  });
});
