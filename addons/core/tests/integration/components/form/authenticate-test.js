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

  test('it renders', async function (assert) {
    assert.expect(1);

    const store = this.owner.lookup('service:store');

    this.model = store.createRecord('auth-method', { type: 'ldap' });
    this.submit = () => {};
    this.disabled = () => {};

    await render(hbs`<Form::Authenticate   
    @model={{this.model}}
    @submit={{this.submit}}
    @disabled={{this.disabled}}/>`);
    assert.ok(find('.full-width'));
  });
});
