/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module(
  'Unit | Route | scopes/scope/authenticate/method/oidc',
  function (hooks) {
    setupTest(hooks);

    let route;
    hooks.beforeEach(function () {
      route = this.owner.lookup('route:scopes/scope/authenticate/method/oidc');
    });

    test('it exists', function (assert) {
      assert.ok(route);
    });

    test('setupController clears UI messages and sets authMethod on the controller', function (assert) {
      assert.expect(2);

      const fakeAuthMethod = { name: 'OIDC', type: 'oidc' };

      const flashMessagesService = this.owner.lookup('service:flash-messages');
      const clearMessagesSpy = sinon.spy(flashMessagesService, 'clearMessages');
      route.flashMessages = flashMessagesService;

      sinon
        .stub(route, 'modelFor')
        .withArgs('scopes.scope.authenticate.method')
        .returns(fakeAuthMethod);

      const controller = this.owner.lookup(
        'controller:scopes/scope/authenticate/method/oidc',
      );
      route.setupController(controller);

      assert.ok(clearMessagesSpy.calledOnce, 'clearMessages was called');
      assert.deepEqual(
        controller.authMethod,
        fakeAuthMethod,
        'controller.authMethod was set correctly',
      );
    });
  },
);
