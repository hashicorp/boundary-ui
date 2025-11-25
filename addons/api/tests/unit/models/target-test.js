/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  TYPE_TARGET_TCP,
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
} from 'api/models/target';
import { setupMirage } from 'api/test-support/helpers/mirage';

module('Unit | Model | target', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has a `hostSets` array of resolved model instances (if those instances are already in the store)', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          host_sources: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '2' },
          ],
        },
      },
    });
    const target = store.peekRecord('target', '123abc');
    assert.strictEqual(
      target.host_sources.length,
      2,
      'Target has two entires in host_sources',
    );
    assert.strictEqual(
      target.hostSets.length,
      0,
      'Target has no resolved hostSets because they are not loaded yet',
    );
    store.push({
      data: {
        id: '1',
        type: 'host-set',
        attributes: {},
      },
    });
    store.push({
      data: {
        id: '3',
        type: 'host-set',
        attributes: {},
      },
    });
    assert.strictEqual(
      target.host_sources.length,
      2,
      'Target has two entires in host_sources',
    );
    assert.strictEqual(
      target.hostSets.length,
      2,
      'Target has two resolved hostSets',
    );
    assert.notOk(
      target.hostSets[0].hostCatalog,
      'Host catalog was not resolved because it is not loaded yet',
    );
    store.push({
      data: {
        id: '2',
        type: 'host-catalog',
        attributes: {},
      },
    });
    // eslint-disable-next-line no-self-assign
    target.host_sources = target.host_sources;
    assert.ok(target.hostSets[0].hostCatalog, 'Host catalog is resolved');
  });

  test('it has an `addHostSources` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/targets/123abc:add-host-sources', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_source_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sources: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.addHostSources(['123_abc', 'foobar']);
  });

  test('it has a `removeHostSources` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/targets/123abc:remove-host-sources',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          host_source_ids: ['1', '3'],
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sources: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeHostSources(['1', '3']);
  });

  test('it has a `removeHostSource` method that deletes a single host set using `removeHostSources` method', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/targets/123abc:remove-host-sources',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          host_source_ids: ['3'],
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sources: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeHostSource('3');
  });

  test('it has a `sessions` array of session instances associated with the target (if those instances are already in the store)', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
      },
    });
    const target = store.peekRecord('target', '123abc');
    assert.strictEqual(target.sessions.length, 0);
    store.push({
      data: {
        id: '1',
        type: 'session',
        attributes: { target_id: '123abc' },
      },
    });
    store.push({
      data: {
        id: '2',
        type: 'session',
        attributes: { target_id: '123abc' },
      },
    });
    store.push({
      data: {
        id: '3',
        type: 'session',
        attributes: { target_id: '456xyz' },
      },
    });
    assert.strictEqual(
      store.peekAll('session').length,
      3,
      'There are 3 sessions loaded in the store',
    );
    assert.strictEqual(
      target.sessions.length,
      2,
      'Target has two associated sessions loaded in the store',
    );
  });

  test('it has a `brokeredCredentialSources` array of resolved model instances (if those instances are already in the store)', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          brokered_credential_source_ids: [{ value: '1' }, { value: '2' }],
        },
      },
    });
    const target = store.peekRecord('target', '123abc');
    assert.strictEqual(
      target.brokered_credential_source_ids.length,
      2,
      'Target has two entires in brokered_credential_source_ids',
    );
    assert.strictEqual(
      target.brokeredCredentialSources.length,
      0,
      'Target has no resolved credentialSources, because they are not yet loaded',
    );
    store.push({
      data: {
        id: '1',
        type: 'credential-library',
        attributes: {},
      },
    });
    store.push({
      data: {
        id: '2',
        type: 'credential-library',
        attributes: {},
      },
    });
    /* eslint-enable no-self-assign */
    assert.strictEqual(
      target.brokered_credential_source_ids.length,
      2,
      'Target has two entires in brokered_credential_source_ids',
    );
    assert.strictEqual(
      target.brokeredCredentialSources.length,
      2,
      'Target has two resolved credentialSources',
    );
  });

  test('it has an `addBrokeredCredentialSources` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/targets/123abc:add-credential-sources',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          brokered_credential_source_ids: ['123_abc', 'foobar'],
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          brokered_credential_source_ids: [{ value: '1' }, { value: '2' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.addBrokeredCredentialSources(['123_abc', 'foobar']);
  });

  test('it has a `removeBrokeredCredentialSources` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/targets/123abc:remove-credential-sources',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          brokered_credential_source_ids: ['1', '2'],
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          brokered_credential_source_ids: [{ value: '1' }, { value: '2' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeBrokeredCredentialSources(['1', '2']);
  });

  test('it has a `removeBrokeredCredentialSource` method that deletes a single credential library using `removeBrokeredCredentialSources` method', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/targets/123abc:remove-credential-sources',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          brokered_credential_source_ids: ['2'],
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          brokered_credential_source_ids: [{ value: '1' }, { value: '2' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeBrokeredCredentialSource('2');
  });

  test('it has isSSH property and returns the expected values', function (assert) {
    const store = this.owner.lookup('service:store');
    const modelSSH = store.createRecord('target', {
      type: TYPE_TARGET_SSH,
    });
    assert.true(modelSSH.isSSH);
    assert.false(modelSSH.isTCP);
    assert.false(modelSSH.isRDP);
  });

  test('it has isTCP property and returns the expected values', function (assert) {
    const store = this.owner.lookup('service:store');
    const modelTCP = store.createRecord('target', {
      type: TYPE_TARGET_TCP,
    });
    assert.true(modelTCP.isTCP);
    assert.false(modelTCP.isSSH);
    assert.false(modelTCP.isRDP);
  });

  test('it has isRDP property and returns the expected values', function (assert) {
    const store = this.owner.lookup('service:store');
    const modelRDP = store.createRecord('target', {
      type: TYPE_TARGET_RDP,
    });
    assert.true(modelRDP.isRDP);
    assert.false(modelRDP.isSSH);
    assert.false(modelRDP.isTCP);
  });
});
