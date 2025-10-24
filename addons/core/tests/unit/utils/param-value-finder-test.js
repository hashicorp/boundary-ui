/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { paramValueFinder } from 'core/utils/param-value-finder';

module('Unit | Utility | param-value-finder', function (hooks) {
  setupTest(hooks);

  test('returns empty array when null or empty routeInfo object is used', function (assert) {
    let result = paramValueFinder('scopes', null);

    assert.deepEqual(result, []);

    result = paramValueFinder('scopes', {});

    assert.deepEqual(result, []);
  });

  test('returns correct array when routeInfo object is used', function (assert) {
    // Route being tested is '/scopes'
    const application = { localName: 'application', params: {}, parent: null };
    const scopes = { localName: 'scopes', params: {}, parent: application };
    const scopesIndex = {
      localName: 'index',
      name: 'scopes.index',
      parent: scopes,
    };
    let result = paramValueFinder('scopes', scopesIndex.parent);

    assert.deepEqual(result, []);

    // Route being tested is '/scopes/global/auth-methods'
    const scope = {
      localName: 'scope',
      params: { scope_id: 'global' },
      parent: scopes,
    };
    const authMethods = {
      localName: 'auth-methods',
      params: {},
      parent: scope,
    };
    const authMethodsIndex = {
      localName: 'index',
      name: 'scopes.scope.auth-methods.index',
      parent: authMethods,
    };
    result = paramValueFinder('scopes', authMethodsIndex.parent);
    assert.deepEqual(result, ['global']);
  });
});
