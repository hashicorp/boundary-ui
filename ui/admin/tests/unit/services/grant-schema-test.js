/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'admin/tests/helpers';
import { grantsSchema } from 'api/utils/grants-schema';

module('Unit | Service | grants-schema', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:grants-schema');
    assert.ok(service);
  });

  test('load fetches and marks data as loaded', async function (assert) {
    const service = this.owner.lookup('service:grants-schema');

    const fetchStub = sinon.stub(globalThis, 'fetch').resolves({
      json: async () => grantsSchema,
    });

    await service.load();
    await service.load();

    assert.true(fetchStub.calledOnce);
    assert.true(fetchStub.calledWith('/grants-schema.json'));
    assert.true(service.isLoaded);
    assert.strictEqual(service.loadError, null);
    assert.deepEqual(service.data, grantsSchema);
    assert.strictEqual(service.findResourceType('target')?.type, 'target');
  });

  test('load fails gracefully when the grants schema request fails', async function (assert) {
    const service = this.owner.lookup('service:grants-schema');
    const error = new Error('network failure');

    sinon.stub(globalThis, 'fetch').rejects(error);

    const didLoad = await service.load();

    assert.false(didLoad);
    assert.false(service.isLoaded);
    assert.strictEqual(service.data, null);
    assert.strictEqual(service.loadError, error);
    assert.deepEqual(service.getResourceTypeNames(), []);
  });

  test('findResourceType returns the matching resource type', function (assert) {
    const service = this.owner.lookup('service:grants-schema');
    service.data = grantsSchema;

    const resourceType = service.findResourceType('credential-library');

    assert.strictEqual(resourceType.type, 'credential-library');
    assert.deepEqual(resourceType.collection_actions, ['create', 'list']);
  });

  test('getResourceTypeNames excludes special resource types', function (assert) {
    const service = this.owner.lookup('service:grants-schema');
    service.data = grantsSchema;

    const resourceTypes = service.getResourceTypeNames();

    assert.true(resourceTypes.includes('target'));
    assert.true(resourceTypes.includes('credential-library'));
    assert.false(resourceTypes.includes('*'));
    assert.false(resourceTypes.includes('unknown'));
  });

  test('getResourceTypeNames returns an empty array when schema is not loaded', function (assert) {
    const service = this.owner.lookup('service:grants-schema');

    assert.deepEqual(service.getResourceTypeNames(), []);
  });
});
