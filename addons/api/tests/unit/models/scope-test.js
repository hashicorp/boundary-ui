/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-mirage/test-support';

module('Unit | Model | scope', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it may have a scope fragment', async function (assert) {
    const store = this.owner.lookup('service:store');
    this.server.get('/scopes', () => ({
      items: [
        { id: 'global', type: 'global' },
        { id: 'o_1', type: 'org', scope: { scope_id: 'global' } },
        { id: 'o_2', type: 'org', scope: { scope_id: 'global' } },
        { id: 'p_1', type: 'project', scope: { scope_id: 'o_1' } },
        { id: 'p_2', type: 'project', scope: { scope_id: 'o_1' } },
        { id: 'p_3', type: 'project', scope: { scope_id: 'o_2' } },
      ],
    }));
    const scopes = await store.query('scope', {});
    // check integrity of scope relationships
    assert.notOk(await scopes[0].get('scope'), 'Global scope has no parent');
    assert.strictEqual(
      await scopes.at(1).get('scope.scope_id'),
      'global',
      'Org 1 parent scope is global',
    );
    assert.strictEqual(
      await scopes.at(2).get('scope.scope_id'),
      'global',
      'Org 2 parent scope is global',
    );
    assert.strictEqual(
      await scopes.at(3).get('scope.scope_id'),
      'o_1',
      'Project 1 parent scope is org 1',
    );
    assert.strictEqual(
      await scopes.at(4).get('scope.scope_id'),
      'o_1',
      'Project 2 parent scope is org 1',
    );
    assert.strictEqual(
      await scopes.at(5).get('scope.scope_id'),
      'o_2',
      'Project 3 parent scope is org 2',
    );
  });

  test('it has isType boolean getters and setters', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('scope', { type: 'global' });
    assert.ok(model.isGlobal);
    assert.notOk(model.isOrg);
    assert.notOk(model.isProject);
    model.isOrg = true;
    assert.notOk(model.isGlobal);
    assert.ok(model.isOrg);
    assert.notOk(model.isProject);
    model.isProject = true;
    assert.notOk(model.isGlobal);
    assert.notOk(model.isOrg);
    assert.ok(model.isProject);
  });

  test('it has an `attachStoragePolicy` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/scopes/123abc:attach-storage-policy',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          storage_policy_id: 'abc',
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'scope',
        attributes: {
          name: 'scope',
          description: 'Description',
          storage_policy_id: 'abc',
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('scope', '123abc');
    await model.attachStoragePolicy('abc');
  });

  test('it has a `detachStoragePolicy` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/scopes/123abc:detach-storage-policy',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          storage_policy_id: 'abc',
          version: 1,
        });
        return { id: '123abc' };
      },
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'scope',
        attributes: {
          name: 'Target',
          description: 'Description',
          storage_policy_id: 'abc',
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('scope', '123abc');
    await model.detachStoragePolicy('abc');
  });
});
