/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Target', function (hooks) {
  setupTest(hooks);

  let abilitiesService;

  hooks.beforeEach(function () {
    abilitiesService = this.owner.lookup('service:abilities');
  });

  test('it reflects when a given target may connect based on authorized_actions', function (assert) {
    const model = {
      authorized_actions: ['authorize-session'],
    };
    assert.true(abilitiesService.can('connect target', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('connect target', model));
  });

  test('it reflects when a given target may add host sources', function (assert) {
    const model = {
      authorized_actions: ['add-host-sources'],
    };
    assert.true(abilitiesService.can('addHostSources target', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('addHostSources target', model));
  });

  test('it reflects when a given target may remove host sources', function (assert) {
    const model = {
      authorized_actions: ['remove-host-sources'],
    };
    assert.true(abilitiesService.can('removeHostSources target', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('removeHostSources target', model));
  });

  test('it reflects when a given target may add brokered credential sources', function (assert) {
    const model = {
      authorized_actions: ['add-credential-sources'],
    };
    assert.true(
      abilitiesService.can('addBrokeredCredentialSources target', model),
    );
    model.authorized_actions = [];
    assert.false(
      abilitiesService.can('addBrokeredCredentialSources target', model),
    );
  });

  test('it reflects when a given target may remove credential sources', function (assert) {
    const model = {
      authorized_actions: ['remove-credential-sources'],
    };
    assert.true(abilitiesService.can('removeCredentialSources target', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('removeCredentialSources target', model));
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
      abilitiesService.can(
        'addInjectedApplicationCredentialSources target',
        model,
      ),
    );
    assert.false(
      abilitiesService.can(
        'addInjectedApplicationCredentialSources target',
        modelWithoutAuthorizedActions,
      ),
    );
    assert.false(
      abilitiesService.can(
        'addInjectedApplicationCredentialSources target',
        modelWithoutSSHType,
      ),
    );
  });
});
