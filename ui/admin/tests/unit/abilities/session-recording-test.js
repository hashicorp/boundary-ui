/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_SESSION_RECORDING_SSH } from 'api/models/session-recording';

module('Unit | Abilities | session-recording', function (hooks) {
  setupTest(hooks);

  let features;
  let canService;
  let store;

  hooks.beforeEach(function () {
    features = this.owner.lookup('service:features');
    features.enable('session-recording');
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('can read session recording feature is enabled', function (assert) {
    assert.expect(2);

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['read'],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );

    assert.true(
      canService.can('read session-recording', recordingWithAuthorizedAction)
    );
    assert.false(
      canService.can('read session-recording', recordingWithoutAuthorizedAction)
    );
  });

  test('cannot read session recording when feature is disabled', function (assert) {
    assert.expect(2);
    features.disable('session-recording');

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['read'],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );

    assert.false(
      canService.can('read session-recording', recordingWithAuthorizedAction)
    );
    assert.false(
      canService.can('read session-recording', recordingWithoutAuthorizedAction)
    );
  });

  test('can list session recording when in global scope', function (assert) {
    assert.expect(2);

    const scopeModelWithAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: ['list'] },
      type: 'global',
      id: 'first',
    });
    const scopeModelWithoutAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: [] },
      type: 'global',
      id: 'second',
    });

    assert.true(
      canService.can('list session-recording', scopeModelWithAuthorizedAction, {
        collection: 'session-recordings',
      })
    );
    assert.false(
      canService.can(
        'list session-recording',
        scopeModelWithoutAuthorizedAction,
        {
          collection: 'session-recordings',
        }
      )
    );
  });

  test('cannot list session recording when in org scope', function (assert) {
    assert.expect(2);

    const scopeModelWithAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: ['list'] },
      type: 'org',
      id: 'first',
    });
    const scopeModelWithoutAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: [] },
      type: 'org',
      id: 'second',
    });

    assert.false(
      canService.can('list session-recording', scopeModelWithAuthorizedAction, {
        collection: 'session-recordings',
      })
    );
    assert.false(
      canService.can(
        'list session-recording',
        scopeModelWithoutAuthorizedAction,
        {
          collection: 'session-recordings',
        }
      )
    );
  });

  test('can navigate to session recording when feature is enabled', function (assert) {
    assert.expect(2);

    const scopeModelWithAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: ['list'] },
      type: 'global',
      id: 'first',
    });
    const scopeModelWithoutAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: [] },
      type: 'global',
      id: 'second',
    });

    assert.true(
      canService.can(
        'navigate session-recording',
        scopeModelWithAuthorizedAction,
        {
          collection: 'session-recordings',
        }
      )
    );
    assert.false(
      canService.can(
        'navigate session-recording',
        scopeModelWithoutAuthorizedAction,
        {
          collection: 'session-recordings',
        }
      )
    );
  });

  test('cannot navigate to session recording when feature is disabled', function (assert) {
    assert.expect(2);
    features.disable('session-recording');

    const scopeModelWithAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: ['list'] },
      type: 'global',
      id: 'first',
    });
    const scopeModelWithoutAuthorizedAction = store.createRecord('scope', {
      authorized_collection_actions: { ['session-recordings']: [] },
      type: 'global',
      id: 'second',
    });

    assert.false(
      canService.can(
        'navigate session-recording',
        scopeModelWithAuthorizedAction,
        {
          collection: 'session-recordings',
        }
      )
    );
    assert.false(
      canService.can(
        'navigate session-recording',
        scopeModelWithoutAuthorizedAction,
        {
          collection: 'session-recordings',
        }
      )
    );
  });

  test('can download asciicast when an ssh recording has download authorization', function (assert) {
    assert.expect(2);

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['download'],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
      }
    );

    assert.true(
      canService.can(
        'downloadAsciiCast session-recording',
        recordingWithAuthorizedAction
      )
    );
    assert.false(
      canService.can(
        'downloadAsciiCast session-recording',
        recordingWithoutAuthorizedAction
      )
    );
  });

  test('cannot download asciicast when a recording is not ssh type', function (assert) {
    assert.expect(2);

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['download'],
        type: 'unknown',
      }
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: 'unknown',
      }
    );

    assert.false(
      canService.can(
        'downloadAsciiCast session-recording',
        recordingWithAuthorizedAction
      )
    );
    assert.false(
      canService.can(
        'downloadAsciiCast session-recording',
        recordingWithoutAuthorizedAction
      )
    );
  });
});
