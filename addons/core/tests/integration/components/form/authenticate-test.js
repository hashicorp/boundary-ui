/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Integration | Component | form | authenticate', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it shows login name and password when LDAP is selected from the list', async function (assert) {
    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
    });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate
  @model={{this.model}}
  @onSubmit={{this.submit}}
  @disabled={{this.disabled}}
/>`);
    assert.ok(find('.full-width'));
    assert.ok(find('.hds-form-text-input'));
    assert.strictEqual(
      find('button[type="submit"]').textContent.trim(),
      'Sign In',
    );
  });

  test('it shows login name and password when password is selected from the list', async function (assert) {
    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate
  @model={{this.model}}
  @onSubmit={{this.submit}}
  @disabled={{this.disabled}}
/>`);
    assert.ok(find('.full-width'));
    assert.ok(find('.hds-form-text-input'));
    assert.strictEqual(
      find('button[type="submit"]').textContent.trim(),
      'Sign In',
    );
  });

  test('it should only show sign in button when OIDC is selected from the list', async function (assert) {
    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
    });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate
  @model={{this.model}}
  @onSubmit={{this.submit}}
  @disabled={{this.disabled}}
/>`);
    assert.ok(find('.full-width'));
    assert.notOk(find('.hds-form-text-input'));
    assert.strictEqual(
      find('button[type="submit"]').textContent.trim(),
      'Sign In',
    );
  });
});
