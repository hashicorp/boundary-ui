/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Target', function (hooks) {
  setupTest(hooks);

  let canService;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
  });

  test('it reflects when a given target may connect based on authorized_actions', function (assert) {
    const model = {
      authorized_actions: ['authorize-session'],
    };
    assert.true(canService.can('connect target', model));
    model.authorized_actions = [];
    assert.false(canService.can('connect target', model));
  });

  test('it reflects when a given target may add host sources', function (assert) {
    const model = {
      authorized_actions: ['add-host-sources'],
    };
    assert.true(canService.can('addHostSources target', model));
    model.authorized_actions = [];
    assert.false(canService.can('addHostSources target', model));
  });

  test('it reflects when a given target may remove host sources', function (assert) {
    const model = {
      authorized_actions: ['remove-host-sources'],
    };
    assert.true(canService.can('removeHostSources target', model));
    model.authorized_actions = [];
    assert.false(canService.can('removeHostSources target', model));
  });

  test('it reflects when a given target may add brokered credential sources', function (assert) {
    const model = {
      authorized_actions: ['add-credential-sources'],
    };
    assert.true(canService.can('addBrokeredCredentialSources target', model));
    model.authorized_actions = [];
    assert.false(canService.can('addBrokeredCredentialSources target', model));
  });

  test('it reflects when a given target may remove credential sources', function (assert) {
    const model = {
      authorized_actions: ['remove-credential-sources'],
    };
    assert.true(canService.can('removeCredentialSources target', model));
    model.authorized_actions = [];
    assert.false(canService.can('removeCredentialSources target', model));
  });

  test('it reflects when a given ssh target may add injected application credential sources', function (assert) {
    const model = {
      authorized_actions: ['add-credential-sources'],
      isSSH: true,
    };
    const modelWithoutAuthorizedActions = {
      authorized_actions: [],
      isSSH: true,
    };
    const modelWithoutSSHType = {
      authorized_actions: ['add-credential-sources'],
    };

    assert.true(
      canService.can('addInjectedApplicationCredentialSources target', model),
    );
    assert.false(
      canService.can(
        'addInjectedApplicationCredentialSources target',
        modelWithoutAuthorizedActions,
      ),
    );
    assert.false(
      canService.can(
        'addInjectedApplicationCredentialSources target',
        modelWithoutSSHType,
      ),
    );
  });
});
