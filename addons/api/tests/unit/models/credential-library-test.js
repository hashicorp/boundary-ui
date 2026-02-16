/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';

module('Unit | Model | credential library', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('credential-library', {});
    assert.ok(model);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
    });
    const modelB = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    const modelC = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
    });
    const modelD = store.createRecord('credential-library', {
      type: 'unknown',
    });

    assert.false(modelA.isUnknown);
    assert.false(modelB.isUnknown);
    assert.false(modelC.isUnknown);
    assert.true(modelD.isUnknown);
  });
});
