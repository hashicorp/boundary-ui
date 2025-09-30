/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_AUTH_METHOD_LDAP,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_PASSWORD,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | auth-methods | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    passwordAuthMethodOrg: null,
    oidcAuthMethodGlobal: null,
    ldapAuthMethod: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    orgAuthMethods: null,
    globalAuthMethods: null,
    passwordAuthMethodOrg: null,
    oidcAuthMethodGlobal: null,
  };

  hooks.beforeEach(async function () {
    // Setup Mirage mock resources for this test
    await authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.passwordAuthMethodOrg = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    instances.oidcAuthMethodGlobal = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.orgAuthMethods = `${urls.orgScope}/auth-methods`;
    urls.globalAuthMethods = `${urls.globalScope}/auth-methods`;
    urls.passwordAuthMethodOrg = `${urls.orgAuthMethods}/${instances.passwordAuthMethodOrg.id}`;
    urls.oidcAuthMethodGlobal = `${urls.globalAuthMethods}/${instances.oidcAuthMethodGlobal.id}`;
  });

  test('visiting auth methods in org scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgAuthMethods));

    assert.strictEqual(currentURL(), urls.orgAuthMethods);
  });

  test('visiting auth methods in global scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalAuthMethods));

    assert.strictEqual(currentURL(), urls.globalAuthMethods);
  });

  test('can navigate to an auth method form in org scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgAuthMethods));

    assert
      .dom(selectors.TABLE_ROW_TYPE(instances.passwordAuthMethodOrg.id))
      .hasText('Password');
    assert
      .dom(selectors.TABLE_ACTION_DROPDOWN(instances.passwordAuthMethodOrg.id))
      .isVisible();

    await click(
      selectors.TABLE_ROW_NAME_LINK(instances.passwordAuthMethodOrg.id),
    );

    assert.strictEqual(currentURL(), urls.passwordAuthMethodOrg);
  });

  test('can navigate to an auth method form in global scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalAuthMethods));

    assert
      .dom(selectors.TABLE_ROW_TYPE(instances.oidcAuthMethodGlobal.id))
      .hasText('OIDC');
    assert
      .dom(selectors.TABLE_ACTION_DROPDOWN(instances.oidcAuthMethodGlobal.id))
      .isVisible();

    await click(
      selectors.TABLE_ROW_NAME_LINK(instances.oidcAuthMethodGlobal.id),
    );

    assert.strictEqual(currentURL(), urls.oidcAuthMethodGlobal);
  });

  test('cannot navigate to an auth method form without proper authorization in org scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.passwordAuthMethodOrg.authorized_actions =
      instances.passwordAuthMethodOrg.authorized_actions.filter(
        (item) => item !== 'read',
      );
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgAuthMethods));

    assert
      .dom(selectors.TABLE_ROW_NAME_LINK(instances.passwordAuthMethodOrg.id))
      .isNotVisible();
  });

  test('cannot navigate to an auth method form without proper authorization in global scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.oidcAuthMethodGlobal.authorized_actions =
      instances.oidcAuthMethodGlobal.authorized_actions.filter(
        (item) => item !== 'read',
      );
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalAuthMethods));

    assert
      .dom(selectors.TABLE_ROW_NAME_LINK(instances.oidcAuthMethodGlobal.id))
      .isNotVisible();
  });

  test('cannot navigate to an ldap auth method form in global scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.global,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalAuthMethods));

    assert
      .dom(selectors.TABLE_ROW_NAME_LINK(instances.ldapAuthMethod.id))
      .doesNotExist();
    assert
      .dom(selectors.TABLE_ROW_TYPE(instances.ldapAuthMethod.id))
      .hasText('LDAP');
    assert
      .dom(selectors.TABLE_ACTION_DROPDOWN(instances.ldapAuthMethod.id))
      .isNotVisible();
  });

  test('cannot navigate to an ldap auth method form in org scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgAuthMethods));

    assert
      .dom(selectors.TABLE_ROW_NAME_LINK(instances.ldapAuthMethod.id))
      .doesNotExist();
    assert
      .dom(selectors.TABLE_ROW_TYPE(instances.ldapAuthMethod.id))
      .hasText('LDAP');
    assert
      .dom(selectors.TABLE_ACTION_DROPDOWN(instances.ldapAuthMethod.id))
      .isNotVisible();
  });

  test('users can navigate to auth method and incorrect url autocorrects', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const orgScope = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    const authMethod = this.server.create('auth-method', {
      scope: orgScope,
    });
    const incorrectUrl = `${urls.globalAuthMethods}/${authMethod.id}/accounts`;
    const correctUrl = `/scopes/${orgScope.id}/auth-methods/${authMethod.id}/accounts`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
