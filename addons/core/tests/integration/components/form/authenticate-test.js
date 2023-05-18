/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | form | authenticate', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it shows login name and password when LDAP is selected from the list', async function (assert) {
    assert.expect(3);

    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', { type: 'ldap' });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate   
    @model={{this.model}}
    @submit={{this.submit}}
    @disabled={{this.disabled}}/>`);
    assert.ok(find('.full-width'));
    assert.ok(find('.hds-form-text-input'));
    assert.strictEqual(
      find('button[type="submit"]').textContent.trim(),
      'Sign In'
    );
  });

  test('it shows login name and password when password is selected from the list', async function (assert) {
    assert.expect(3);

    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', { type: 'password' });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate   
    @model={{this.model}}
    @submit={{this.submit}}
    @disabled={{this.disabled}}/>`);
    assert.ok(find('.full-width'));
    assert.ok(find('.hds-form-text-input'));
    assert.strictEqual(
      find('button[type="submit"]').textContent.trim(),
      'Sign In'
    );
  });

  test('it should only show sign in button when OIDC is selected from the list', async function (assert) {
    assert.expect(3);

    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', { type: 'oidc' });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate   
    @model={{this.model}}
    @submit={{this.submit}}
    @disabled={{this.disabled}}/>`);
    assert.ok(find('.full-width'));
    assert.notOk(find('.hds-form-text-input'));
    assert.strictEqual(
      find('button[type="submit"]').textContent.trim(),
      'Sign In'
    );
  });
});
