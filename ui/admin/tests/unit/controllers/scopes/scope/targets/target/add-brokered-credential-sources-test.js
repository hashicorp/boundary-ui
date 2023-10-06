/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | scopes/scope/targets/target/add-brokered-credential-sources',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-brokered-credential-sources'
      );
      assert.ok(controller);
    });

    test('hasAvailableBrokeredCredentialSources returns true if target has available credentials', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-brokered-credential-sources'
      );

      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_123' }],
      });
      const credentialLibraries = [
        store.createRecord('credential-library', {}),
      ];
      const credentials = [store.createRecord('credential', {})];
      controller.set('model', { target, credentialLibraries, credentials });

      assert.true(controller.hasAvailableBrokeredCredentialSources);
    });

    test('hasAvailableBrokeredCredentialSources returns false if target has no available credentials', function (assert) {
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-brokered-credential-sources'
      );

      const target = store.createRecord('target', {
        brokered_credential_source_ids: [{ value: 'cred_123' }],
      });
      controller.set('model', {
        target,
        credentialLibraries: [],
        credentials: [],
      });

      assert.false(controller.hasAvailableBrokeredCredentialSources);
    });
  }
);
