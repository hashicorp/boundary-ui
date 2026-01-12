/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
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

  const permissionWithActiveScopes = {
    grant: ['type=host-catalog;actions=list'],
    grant_scopes: ['this', 'p_123456'],
    deleted_scopes: [],
  };

  const anotherPermission = {
    label: 'Another Permission',
    grant: ['type=host-catalog;actions=list', 'type=user;actions=read'],
    grant_scopes: ['this', 'children', 'p_654321'],
    deleted_scopes: [],
  };

  const permissionWithNoActiveScopes = {
    grant: ['type=host-catalog;actions=list'],
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
          .dom('.app-token-permissions-alert')
          .isVisible('Displays warning for permissions with no active scopes');
      } else {
        assert
          .dom('.app-token-permissions-alert')
          .doesNotExist(
            'No warning displayed when all permissions have active scopes',
          );
      }
    },
  );
});
