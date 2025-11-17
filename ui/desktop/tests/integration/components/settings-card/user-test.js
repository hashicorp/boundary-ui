/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

const data = {
  authenticated: {
    authenticator: 'authenticator:password',
  },
};

const USERNAME = '[data-test-username]';
const AUTH_METHOD_TYPE = '[data-test-auth-method]';
const AUTHENTICATION_BADGE = '.hds-badge__text';

module('Integration | Component | settings-card/user', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.set('application', { showModalOrLogout: () => {} });
  });

  test('it renders password correctly', async function (assert) {
    this.owner.register(
      'service:session',
      class extends Service {
        data = data;
        isAuthenticated = true;
        username = 'admin';
      },
    );

    await render(
      hbs`<SettingsCard::User @onSignout={{this.application.showModalOrLogout}} />`,
    );

    assert.dom(AUTHENTICATION_BADGE).hasText('Authenticated');
    assert.dom(AUTH_METHOD_TYPE).hasText('Password');
    assert.dom(USERNAME).hasText('admin');
  });

  test('it renders OIDC correctly', async function (assert) {
    let oidcData = structuredClone(data);
    oidcData.authenticated.authenticator = 'authenticator:oidc';
    this.owner.register(
      'service:session',
      class extends Service {
        data = oidcData;
        isAuthenticated = true;
        username = 'admin';
      },
    );

    await render(
      hbs`<SettingsCard::User @onSignout={{this.application.showModalOrLogout}} />`,
    );

    assert.dom(AUTHENTICATION_BADGE).hasText('Authenticated');
    assert.dom(AUTH_METHOD_TYPE).hasText('OIDC');
    assert.dom(USERNAME).hasText('admin');
  });

  test('it renders LDAP correctly', async function (assert) {
    let ldapData = structuredClone(data);
    ldapData.authenticated.authenticator = 'authenticator:ldap';
    this.owner.register(
      'service:session',
      class extends Service {
        data = ldapData;
        isAuthenticated = true;
        username = 'admin';
      },
    );

    await render(
      hbs`<SettingsCard::User @onSignout={{this.application.showModalOrLogout}} />`,
    );

    assert.dom(AUTHENTICATION_BADGE).hasText('Authenticated');
    assert.dom(AUTH_METHOD_TYPE).hasText('LDAP');
    assert.dom(USERNAME).hasText('admin');
  });
});
