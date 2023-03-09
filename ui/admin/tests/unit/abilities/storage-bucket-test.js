/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_STORAGE_BUCKET_PLUGIN,
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
} from 'api/models/storage-bucket';

module('Unit | Abilities | storage-bucket', function (hooks) {
  setupTest(hooks);

  let features;

  hooks.beforeEach(function () {
    features = this.owner.lookup('service:features');
    features.enable('session-recording');
  });

  test('can read storage bucket when authorized and feature is enabled', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const storageBucket = store.createRecord('storage-bucket', {
      authorized_actions: ['read'],
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });

    assert.true(canService.can('read storage-bucket', storageBucket));
  });

  test('cannot read storage bucket when unauthorized and feature is enabled', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const storageBucket = store.createRecord('storage-bucket', {
      authorized_actions: [],
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });

    assert.false(canService.can('read storage-bucket', storageBucket));
  });

  test('cannot read storage bucket when authorized and feature is disabled', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    features.disable('session-recording');

    const storageBucket = store.createRecord('storage-bucket', {
      authorized_actions: ['read'],
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });

    assert.false(canService.can('read storage-bucket', storageBucket));
  });

  test('cannot read storage bucket when unauthorized and feature is disabled', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');
    features.disable('session-recording');

    const storageBucket = store.createRecord('storage-bucket', {
      authorized_actions: [],
      type: TYPE_STORAGE_BUCKET_PLUGIN,
      compositeType: TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
    });

    assert.false(canService.can('read storage-bucket', storageBucket));
  });

  test('can list storage bucket when authorized and in global scope', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': ['list'] },
      type: 'global',
      id: 'global',
    });

    assert.true(
      canService.can('list storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('cannot list storage bucket when unauthorized and in global scope', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': [] },
      type: 'global',
      id: 'global',
    });

    assert.false(
      canService.can('list storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('cannot list storage bucket when authorized and in org scope', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': ['list'] },
      type: 'org',
      id: 'o_123',
    });

    assert.false(
      canService.can('list storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('can create storage bucket when authorized and in global scope', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': ['create'] },
      type: 'global',
      id: 'global',
    });

    assert.true(
      canService.can('create storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('can create storage bucket when authorized and in org scope', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': ['create'] },
      type: 'org',
      id: 'o_123',
    });

    assert.true(
      canService.can('create storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('cannot create storage bucket when authorized and in project scope', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': ['create'] },
      type: 'project',
      id: 'p_123',
    });

    assert.false(
      canService.can('create storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('cannot create storage bucket when unauthorized', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': [] },
      type: 'global',
      id: 'global',
    });

    assert.false(
      canService.can('create storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });

  test('can navigate to storage bucket when authorized', function (assert) {
    assert.expect(1);
    const canService = this.owner.lookup('service:can');
    const store = this.owner.lookup('service:store');

    const scopeModel = store.createRecord('scope', {
      authorized_collection_actions: { 'storage-buckets': ['create'] },
      type: 'global',
      id: 'global',
    });

    assert.true(
      canService.can('navigate storage-bucket', scopeModel, {
        collection: 'storage-buckets',
      })
    );
  });
});
