/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | group', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has a `members` array of resolved model instances (if those instances are already in the store)', function (assert) {
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'group_123',
        type: 'group',
        attributes: {
          member_ids: ['1', '2'],
        },
      },
    });
    const group = store.peekRecord('group', 'group_123');
    assert.strictEqual(
      group.member_ids.length,
      2,
      'Group has two entires in member_ids',
    );
    assert.strictEqual(
      group.members.length,
      0,
      'Group has no resolved members because they are not loaded yet',
    );
    store.push({
      data: {
        id: '1',
        type: 'user',
        attributes: {},
      },
    });
    store.push({
      data: {
        id: '2',
        type: 'user',
        attributes: {},
      },
    });
    // eslint-disable-next-line no-self-assign
    group.member_ids = [...group.member_ids];
    assert.strictEqual(
      group.member_ids.length,
      2,
      'Group has two entires in member_ids',
    );
    assert.strictEqual(
      group.members.length,
      2,
      'Group has two resolved members',
    );
  });

  test('it has an `addMembers` method that groups a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/groups/123abc:add-members', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        member_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'group',
        attributes: {
          name: 'Group',
          description: 'Description',
          member_ids: ['1', '2'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('group', '123abc');
    await model.addMembers(['123_abc', 'foobar']);
  });

  test('it has a `removeMembers` method that groups a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/groups/123abc:remove-members', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        member_ids: ['1', '3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'group',
        attributes: {
          name: 'group',
          description: 'Description',
          member_ids: ['4', '5'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('group', '123abc');
    await model.removeMembers(['1', '3']);
  });

  test('it has a `removeMember` method that deletes a single member set using `removeMembers` method', async function (assert) {
    assert.expect(1);
    this.server.post('/groups/123abc:remove-members', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        member_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'group',
        attributes: {
          name: 'group',
          description: 'Description',
          member_ids: ['1', '3'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('group', '123abc');
    await model.removeMember('3');
  });

  test('it defaults `members_ids` to an empty array when model instance does not define it', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'group_123',
        type: 'group',
      },
    });
    const group = store.peekRecord('group', 'group_123');
    assert.strictEqual(
      group.member_ids.length,
      0,
      'Group has empty member_ids by default',
    );
  });
});
