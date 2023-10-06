/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/targets/target/add-injected-application-credential-sources',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-injected-application-credential-sources'
      );
      assert.ok(controller);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns true if target has available credentials', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-injected-application-credential-sources'
      );

      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [{ value: 'cred_123' }],
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {}),
      ];
      const credentials = [store.createRecord('credential', {})];
      controller.set('model', { target, credentialLibraries, credentials });

      assert.true(controller.hasAvailableInjectedApplicationCredentialSources);
    });

    test('hasAvailableInjectedApplicationCredentialSources returns false if target has no available credentials', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-injected-application-credential-sources'
      );

      const target = store.createRecord('target', {
        injected_application_credential_source_ids: [{ value: 'cred_123' }],
      });
      controller.set('model', {
        target,
        credentialLibraries: [],
        credentials: [],
      });

      assert.false(controller.hasAvailableInjectedApplicationCredentialSources);
    });
  }
);
