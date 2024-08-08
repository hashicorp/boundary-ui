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
    username: 'admin',
    authenticator: 'authenticator:password',
  },
};

module('Integration | Component | settings-card/user', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders password correctly', async function (assert) {
    this.owner.register(
      'service:session',
      class extends Service {
        data = data;
        isAuthenticated = true;
      },
    );

    await render(hbs`<SettingsCard::User />`);

    assert.dom('.hds-badge__text').hasText('Authenticated');
    assert.dom('[data-test-auth-method]').hasText('Password');
    assert.dom('[data-test-username]').hasText('admin');
  });

  test('it renders OIDC correctly', async function (assert) {
    let oidcData = structuredClone(data);
    oidcData.authenticated.authenticator = 'authenticator:oidc';
    this.owner.register(
      'service:session',
      class extends Service {
        data = oidcData;
        isAuthenticated = true;
      },
    );

    await render(hbs`<SettingsCard::User />`);

    assert.dom('.hds-badge__text').hasText('Authenticated');
    assert.dom('[data-test-auth-method]').hasText('OIDC');
    assert.dom('[data-test-username]').hasText('admin');
  });

  test('it renders LDAP correctly', async function (assert) {
    let ldapData = structuredClone(data);
    ldapData.authenticated.authenticator = 'authenticator:ldap';
    this.owner.register(
      'service:session',
      class extends Service {
        data = ldapData;
        isAuthenticated = true;
      },
    );

    await render(hbs`<SettingsCard::User />`);

    assert.dom('.hds-badge__text').hasText('Authenticated');
    assert.dom('[data-test-auth-method]').hasText('LDAP');
    assert.dom('[data-test-username]').hasText('admin');
  });
});
