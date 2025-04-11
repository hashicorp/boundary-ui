/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import Controller from '@ember/controller';
import sinon from 'sinon';

module(
  'Unit | Route | scopes/scope/authenticate/method/oidc',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:scopes/scope/authenticate/method/oidc',
      );
      assert.ok(route);
    });

    test('setupController clears UI messages and sets authMethod on the controller', function (assert) {
      assert.expect(2);

      class FlashMessagesStub extends Service {
        clearMessages() {
          assert.ok(true, 'flashMessages.clearMessages was called');
        }
      }

      this.owner.register('service:flash-messages', FlashMessagesStub);

      const controller = new (class extends Controller {})();
      const route = this.owner.lookup(
        'route:scopes/scope/authenticate/method/oidc',
      );

      const fakeAuthMethod = { name: 'OIDC', type: 'oidc' };
      route.modelFor = () => fakeAuthMethod;

      route.setupController(controller);

      assert.deepEqual(
        controller.authMethod,
        fakeAuthMethod,
        'controller.authMethod was set correctly',
      );
    });

    test('setupController clears flash messages', function (assert) {
      assert.expect(2);

      // Get the route instance
      const route = this.owner.lookup(
        'route:scopes/scope/authenticate/method/oidc',
      );

      // Mock the flashMessages service
      const flashMessages = {
        clearMessages: sinon.spy(),
      };
      route.flashMessages = flashMessages;

      // Mock the controller and model
      const controller = {};
      const authMethod = { id: 'test-auth-method' };
      sinon
        .stub(route, 'modelFor')
        .withArgs('scopes.scope.authenticate.method')
        .returns(authMethod);

      // Call setupController
      route.setupController(controller);

      // Assert that clearMessages was called
      assert.ok(
        flashMessages.clearMessages.calledOnce,
        'clearMessages was called',
      );

      // Assert that the authMethod was set on the controller
      assert.strictEqual(
        controller.authMethod,
        authMethod,
        'authMethod was set on the controller',
      );
    });
  },
);
