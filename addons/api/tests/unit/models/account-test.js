/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

module('Unit | Model | account', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {});
    assert.ok(model);
  });

  test('it has an accountName attribute for password account', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    let model = store.createRecord('account', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    assert.notOk(model.accountName);
    model.login_name = 'foobar';
    assert.strictEqual(model.accountName, 'foobar');
  });
});
