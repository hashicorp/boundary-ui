/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

module('Unit | Controller | scopes/scope/roles/role/scopes', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let controller;

  const instances = {
    scopes: {
      global: null,
    },
    role: null,
  };

  const urls = {
    globalScope: null,
    scopes: null,
  };

  hooks.beforeEach(async function () {
    authenticateSession({});
    controller = this.owner.lookup('controller:scopes/scope/roles/role/scopes');

    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.role = this.server.create('role', {
      scopeId: 'global',
    });

    urls.globalScope = `/scopes/global`;
    urls.scopes = `${urls.globalScope}/roles/${instances.role.id}/scopes`;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('isKeywordThis action returns true if id is GRANT_SCOPE_THIS', function (assert) {
    assert.ok(controller.isKeywordThis(GRANT_SCOPE_THIS));
    assert.notOk(controller.isKeywordThis(GRANT_SCOPE_CHILDREN));
  });

  test('isKeywordChildren action returns true if id is GRANT_SCOPE_CHILDREN', function (assert) {
    assert.ok(controller.isKeywordChildren(GRANT_SCOPE_CHILDREN));
    assert.notOk(controller.isKeywordChildren(GRANT_SCOPE_DESCENDANTS));
  });

  test('isKeywordDescendants action returns true if id is GRANT_SCOPE_DESCENDANTS', function (assert) {
    assert.ok(controller.isKeywordDescendants(GRANT_SCOPE_DESCENDANTS));
    assert.notOk(controller.isKeywordDescendants(GRANT_SCOPE_THIS));
  });
});
