/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Scope', function (hooks) {
  setupTest(hooks);

  let features;
  let abilitiesService;
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    abilitiesService = this.owner.lookup('service:abilities');
    features = this.owner.lookup('service:features');
  });

  test('can attach storage policy when authorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: ['attach-storage-policy'],
    });
    assert.true(abilitiesService.can('attachStoragePolicy scope', scopeModel));
  });

  test('cannot attach storage policy when unauthorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: [],
    });

    assert.false(abilitiesService.can('attachStoragePolicy scope', scopeModel));
  });

  test('can detach storage policy when authorized', function (assert) {
    features.enable('ssh-session-recording');

    const scopeModel = store.createRecord('scope', {
      authorized_actions: ['detach-storage-policy'],
    });
    assert.true(abilitiesService.can('detachStoragePolicy scope', scopeModel));
  });

  test.each(
    'canSetAliasSuffix reflects scope type and authorized action',
    {
      'project with action': {
        type: 'project',
        authorized_actions: ['set-alias-target-suffix'],
        expected: true,
      },
      'project without action': {
        type: 'project',
        authorized_actions: [],
        expected: false,
      },
      'org with action': {
        type: 'org',
        authorized_actions: ['set-alias-target-suffix'],
        expected: false,
      },
      'global with action': {
        type: 'global',
        authorized_actions: ['set-alias-target-suffix'],
        expected: false,
      },
    },
    function (assert, { type, authorized_actions, expected }) {
      const scopeModel = store.createRecord('scope', {
        type,
        authorized_actions,
      });
      assert.strictEqual(
        abilitiesService.can('setAliasSuffix scope', scopeModel),
        expected,
      );
    },
  );

  test.each(
    'canRemoveAliasSuffix reflects scope type, authorized action, and suffix presence',
    {
      'project with action and suffix': {
        type: 'project',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: '.example',
        expected: true,
      },
      'project with action but no suffix': {
        type: 'project',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: '',
        expected: false,
      },
      'project with suffix but no action': {
        type: 'project',
        authorized_actions: [],
        alias_suffix: '.example',
        expected: false,
      },
      'org with action and suffix': {
        type: 'org',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: '.example',
        expected: false,
      },
      'global with action and suffix': {
        type: 'global',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: '.example',
        expected: false,
      },
    },
    function (assert, { type, authorized_actions, alias_suffix, expected }) {
      const scopeModel = store.createRecord('scope', {
        type,
        authorized_actions,
        alias_suffix,
      });
      assert.strictEqual(
        abilitiesService.can('removeAliasSuffix scope', scopeModel),
        expected,
      );
    },
  );
});
