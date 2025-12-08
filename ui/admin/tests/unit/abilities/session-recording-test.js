/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_SESSION_RECORDING_SSH,
  STATE_SESSION_RECORDING_AVAILABLE,
} from 'api/models/session-recording';
import { faker } from '@faker-js/faker';

module('Unit | Abilities | session-recording', function (hooks) {
  setupTest(hooks);

  let features;
  let canService;
  let store;

  hooks.beforeEach(function () {
    features = this.owner.lookup('service:features');
    canService = this.owner.lookup('service:can');
    store = this.owner.lookup('service:store');
  });

  test('can read session recording feature is enabled', function (assert) {
    features.enable('ssh-session-recording');

    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['read'],
        type: TYPE_SESSION_RECORDING_SSH,
      },
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
      },
    );

    assert.true(
      canService.can('read session-recording', recordingWithAuthorizedAction),
    );
    assert.false(
      canService.can(
        'read session-recording',
        recordingWithoutAuthorizedAction,
      ),
    );
  });

  test('cannot read session recording when feature is disabled', function (assert) {
    const recordingWithAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: ['read'],
        type: TYPE_SESSION_RECORDING_SSH,
      },
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
      },
    );

    assert.false(
      canService.can('read session-recording', recordingWithAuthorizedAction),
    );
    assert.false(
      canService.can(
        'read session-recording',
        recordingWithoutAuthorizedAction,
      ),
    );
  });

  test('can list session recording when in global scope', function (assert) {
    features.enable('ssh-session-recording');

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
      canService.can('list scope', scopeModelWithAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
    assert.false(
      canService.can('list scope', scopeModelWithoutAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
  });

  test('can list session recording when in org scope when authorized', function (assert) {
    features.enable('ssh-session-recording');

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

    assert.true(
      canService.can('list scope', scopeModelWithAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
    assert.false(
      canService.can('list scope', scopeModelWithoutAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
  });

  test('can navigate to session recording when feature is enabled', function (assert) {
    features.enable('ssh-session-recording');

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
      canService.can('navigate scope', scopeModelWithAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
    assert.false(
      canService.can('navigate scope', scopeModelWithoutAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
  });

  test('cannot navigate to session recording when feature is disabled', function (assert) {
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
      canService.can('navigate scope', scopeModelWithAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
    assert.false(
      canService.can('navigate scope', scopeModelWithoutAuthorizedAction, {
        collection: 'session-recordings',
      }),
    );
  });

  test('can delete session recording when feature is enabled', async function (assert) {
    features.enable('ssh-session-recording');
    const recordingWithAuthorizedAction = await store.createRecord(
      'session-recording',
      {
        authorized_actions: ['delete'],
        type: TYPE_SESSION_RECORDING_SSH,
        state: STATE_SESSION_RECORDING_AVAILABLE,
        retain_until: faker.date.recent(),
      },
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
        state: STATE_SESSION_RECORDING_AVAILABLE,
        retain_until: faker.date.recent(),
      },
    );

    assert.true(
      canService.can('delete session-recording', recordingWithAuthorizedAction),
    );
    assert.false(
      canService.can(
        'delete session-recording',
        recordingWithoutAuthorizedAction,
      ),
    );
  });

  test('cannot delete session recording when feature is enabled but retain policy is forever', async function (assert) {
    features.enable('ssh-session-recording');
    const recordingWithAuthorizedAction = await store.createRecord(
      'session-recording',
      {
        authorized_actions: ['delete'],
        type: TYPE_SESSION_RECORDING_SSH,
        state: STATE_SESSION_RECORDING_AVAILABLE,
        retain_until: new Date('9999-12-31T23:23:23.999Z'),
      },
    );
    const recordingWithoutAuthorizedAction = store.createRecord(
      'session-recording',
      {
        authorized_actions: [],
        type: TYPE_SESSION_RECORDING_SSH,
        state: STATE_SESSION_RECORDING_AVAILABLE,
        retain_until: new Date('9999-12-31T23:23:23.999Z'),
      },
    );

    assert.false(
      canService.can('delete session-recording', recordingWithAuthorizedAction),
    );
    assert.false(
      canService.can(
        'delete session-recording',
        recordingWithoutAuthorizedAction,
      ),
    );
  });
});
