/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Ability | session-recording', function (hooks) {
  setupTest(hooks);

  let canService;
  let store;

  hooks.beforeEach(function () {
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:session-recording');
    assert.ok(ability);
  });

  test('can download when a recording has download authorization', function (assert) {
    assert.expect(2);

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['download'],
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
      }
    );

    assert.true(
      canService.can(
        'download session-recording',
        recordingWithAuthorizedAction
      )
    );
    assert.false(
      canService.can(
        'download session-recording',
        recordingWithoutAuthorizedAction
      )
    );
  });
});
