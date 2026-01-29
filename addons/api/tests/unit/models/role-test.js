/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

module('Unit | Model | role', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('role', {});
    assert.ok(model);
  });

  test('it has a `setGrantScopes` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/roles/r_123:set-grant-scopes', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        grant_scope_ids: ['this', 'children'],
        version: 1,
      });
      return { id: 'r_123' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'r_123',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          grant_scope_ids: ['this'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', 'r_123');
    await model.setGrantScopes(['this', 'children']);
  });

  test('it has a `saveGrantStrings` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/roles/123abc:set-grants', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        grant_strings: ['foo', 'bar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          grant_strings: ['grant1', 'grant2'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.saveGrantStrings(['foo', 'bar']);
  });

  test('it has an `addPrincipals` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/roles/123abc:add-principals', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        principal_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          principals: [
            { id: '1', type: 'user' },
            { id: '3', type: 'group' },
            { id: '5', type: 'managed group' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.addPrincipals(['123_abc', 'foobar']);
  });

  test('it has a `removePrincipals` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/roles/123abc:remove-principals', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        principal_ids: ['1', '3', '5'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          principals: [
            { id: '1', type: 'user' },
            { id: '3', type: 'group' },
            { id: '5', type: 'managed group' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.removePrincipals(['1', '3', '5']);
  });

  test('it has a `removePrincipal` method that deletes a single principal using `removePrincipals` method', async function (assert) {
    assert.expect(1);
    this.server.post('/roles/123abc:remove-principals', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        principal_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          principals: [
            { id: '1', type: 'user' },
            { id: '3', type: 'group' },
            { id: '5', type: 'managed group' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.removePrincipal('3');
  });

  test('grantScopes returns an empty array when no grant_scope_ids are present', async function (assert) {
    const store = this.owner.lookup('service:store');
    const role = store.createRecord('role');

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 0);
  });

  test('grantScopes returns an empty array when no grant_scope_ids are loaded', async function (assert) {
    const store = this.owner.lookup('service:store');
    const role = store.createRecord('role', {
      grant_scope_ids: ['o_123'],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 0);
  });

  test('grantScopes returns an array of scope records', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const role = store.createRecord('role', {
      grant_scope_ids: [orgScope.id],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 1);
    assert.strictEqual(grantScopes[0].id, orgScope.id);
  });

  test('grantScopes returns an array of scope records ordered by orgs then projects', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const role = store.createRecord('role', {
      grant_scope_ids: [projectScope.id, orgScope.id],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 2);
    assert.strictEqual(grantScopes[0].id, orgScope.id);
    assert.strictEqual(grantScopes[1].id, projectScope.id);
  });

  test('grantScopes returns an array of keywords and scope records', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const role = store.createRecord('role', {
      grant_scope_ids: [projectScope.id, GRANT_SCOPE_THIS, orgScope.id],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 3);
    assert.strictEqual(grantScopes[0].id, GRANT_SCOPE_THIS);
    assert.strictEqual(grantScopes[1].id, orgScope.id);
    assert.strictEqual(grantScopes[2].id, projectScope.id);
  });

  test('grantScopes orders keywords by this, children, descendants', async function (assert) {
    // A role cannot have this, children, and descendants at the same time
    // but for testing purposes, we want to show the order they are sorted in
    const store = this.owner.lookup('service:store');
    const role = store.createRecord('role', {
      grant_scope_ids: [
        GRANT_SCOPE_CHILDREN,
        GRANT_SCOPE_DESCENDANTS,
        GRANT_SCOPE_THIS,
      ],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 3);
    assert.strictEqual(grantScopes[0].id, GRANT_SCOPE_THIS);
    assert.strictEqual(grantScopes[1].id, GRANT_SCOPE_CHILDREN);
    assert.strictEqual(grantScopes[2].id, GRANT_SCOPE_DESCENDANTS);
  });

  test('grantScopes returns an array of keywords and scopes in the correct order', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const role = store.createRecord('role', {
      grant_scope_ids: [
        projectScope.id,
        GRANT_SCOPE_THIS,
        orgScope.id,
        GRANT_SCOPE_CHILDREN,
      ],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 4);
    assert.strictEqual(grantScopes[0].id, GRANT_SCOPE_THIS);
    assert.strictEqual(grantScopes[1].id, GRANT_SCOPE_CHILDREN);
    assert.strictEqual(grantScopes[2].id, orgScope.id);
    assert.strictEqual(grantScopes[3].id, projectScope.id);
  });

  test('grantScopes returns an array that orders global after keywords and before orgs and/or projects', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const globalScope = store.createRecord('scope', { id: 'global' });
    const role = store.createRecord('role', {
      grant_scope_ids: [
        projectScope.id,
        orgScope.id,
        GRANT_SCOPE_CHILDREN,
        globalScope.id,
      ],
    });

    const grantScopes = role.grantScopes;

    assert.strictEqual(grantScopes.length, 4);
    assert.strictEqual(grantScopes[0].id, GRANT_SCOPE_CHILDREN);
    assert.strictEqual(grantScopes[1].id, globalScope.id);
    assert.strictEqual(grantScopes[2].id, orgScope.id);
    assert.strictEqual(grantScopes[3].id, projectScope.id);
  });

  test('grantScopeKeywords returns an array with only keywords in grant_scope_ids', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const globalScope = store.createRecord('scope', { id: 'global' });
    const role = store.createRecord('role', {
      grant_scope_ids: [
        projectScope.id,
        orgScope.id,
        GRANT_SCOPE_THIS,
        globalScope.id,
      ],
    });

    const grantScopeKeywords = role.grantScopeKeywords;

    assert.strictEqual(grantScopeKeywords.length, 1);
    assert.strictEqual(grantScopeKeywords[0], GRANT_SCOPE_THIS);
  });

  test('grantScopeOrgIDs returns an array with only org ids in grant_scope_ids', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const globalScope = store.createRecord('scope', { id: 'global' });
    const role = store.createRecord('role', {
      grant_scope_ids: [
        projectScope.id,
        orgScope.id,
        GRANT_SCOPE_THIS,
        globalScope.id,
      ],
    });

    const grantScopeOrgIDs = role.grantScopeOrgIDs;

    assert.strictEqual(grantScopeOrgIDs.length, 1);
    assert.strictEqual(grantScopeOrgIDs[0], orgScope.id);
  });

  test('grantScopeProjectIDs returns an array with only project ids in grant_scope_ids', async function (assert) {
    const store = this.owner.lookup('service:store');
    const orgScope = store.createRecord('scope', { id: 'o_123' });
    const projectScope = store.createRecord('scope', { id: 'p_123' });
    const globalScope = store.createRecord('scope', { id: 'global' });
    const role = store.createRecord('role', {
      grant_scope_ids: [
        projectScope.id,
        orgScope.id,
        GRANT_SCOPE_THIS,
        globalScope.id,
      ],
    });

    const grantScopeProjectIDs = role.grantScopeProjectIDs;

    assert.strictEqual(grantScopeProjectIDs.length, 1);
    assert.strictEqual(grantScopeProjectIDs[0], projectScope.id);
  });
});
