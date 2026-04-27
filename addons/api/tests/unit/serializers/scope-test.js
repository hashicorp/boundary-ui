/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | scope', function (hooks) {
  setupTest(hooks);

  test('it serializes normally when no `adapterOptions` method or policyId is passed', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('scope');
    const record = store.createRecord('scope', {
      type: 'project',
      name: 'Project',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    const serializedRecord = serializer.serialize(snapshot);
    assert.strictEqual(serializedRecord.name, 'Project');
    assert.strictEqual(serializedRecord.description, 'Description');
    assert.strictEqual(serializedRecord.version, 1);
  });

  test('it serializes only version and storage_policy_id when an `adapterOptions.policyId` is passed', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('scope');
    const record = store.createRecord('scope', {
      type: 'org',
      name: 'Org',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      policyId: 'abc',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      storage_policy_id: 'abc',
      version: 1,
    });
  });

  test('it serializes only version and alias_suffix when `adapterOptions.method` is `set-alias-target-suffix`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('scope');
    const record = store.createRecord('scope', {
      type: 'project',
      name: 'Project',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'set-alias-target-suffix',
      alias_suffix: '.example',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      alias_suffix: '.example',
      version: 1,
    });
  });

  test('it serializes only version when `adapterOptions.method` is `remove-alias-target-suffix`', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('scope');
    const record = store.createRecord('scope', {
      type: 'project',
      name: 'Project',
      description: 'Description',
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      method: 'remove-alias-target-suffix',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      version: 1,
    });
  });
});
