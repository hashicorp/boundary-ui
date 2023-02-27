/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from 'api/models/credential-library';

module('Unit | Abilities | credential-library', function (hooks) {
  setupTest(hooks);

  let features;

  hooks.beforeEach(function () {
    features = this.owner.lookup('service:features');
    features.enable('credential-library-vault-ssh-certificate');
  });

  test('can read credential library type when authorized and feature is enabled', function (assert) {
    assert.expect(2);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const credentialLibrary = store.createRecord('credential-library', {
      authorized_actions: ['read'],
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    assert.true(canService.can('read credential-library', credentialLibrary));
    credentialLibrary.type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
    assert.true(canService.can('read credential-library', credentialLibrary));
  });

  test('cannot read credential library type when unauthorized and feature is enabled', function (assert) {
    assert.expect(2);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const credentialLibrary = store.createRecord('credential-library', {
      authorized_actions: [],
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    assert.false(canService.can('read credential-library', credentialLibrary));
    credentialLibrary.type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
    assert.false(canService.can('read credential-library', credentialLibrary));
  });

  test('cannot read credential library type when unauthorized and feature is disabled', function (assert) {
    assert.expect(2);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('credential-library-vault-ssh-certificate');
    const credentialLibrary = store.createRecord('credential-library', {
      authorized_actions: [],
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    assert.false(canService.can('read credential-library', credentialLibrary));
    credentialLibrary.type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
    assert.false(canService.can('read credential-library', credentialLibrary));
  });

  test('can read vault-generic but not vault-ssh-certificate when authorized and feature is disabled', function (assert) {
    assert.expect(2);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('credential-library-vault-ssh-certificate');
    const credentialLibrary = store.createRecord('credential-library', {
      authorized_actions: ['read'],
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
    });
    assert.false(canService.can('read credential-library', credentialLibrary));
    credentialLibrary.type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
    assert.true(canService.can('read credential-library', credentialLibrary));
  });
});
