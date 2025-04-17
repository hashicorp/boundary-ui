/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from '@ember/controller';
import sinon from 'sinon';

module(
  'Unit | Route | scopes/scope/authenticate/method/oidc',
  function (hooks) {
    setupTest(hooks);

    let route = this.owner.lookup(
      'route:scopes/scope/authenticate/method/oidc',
    );

    test('it exists', function (assert) {
      assert.ok(route);
    });

    test('setupController clears UI messages and sets authMethod on the controller', function (assert) {
      assert.expect(2);

      let flashMessagesService, clearMessagesSpy;
      const fakeAuthMethod = { name: 'OIDC', type: 'oidc' };

      flashMessagesService = this.owner.lookup('service:flash-messages');
      clearMessagesSpy = sinon.spy(flashMessagesService, 'clearMessages');
      route.flashMessages = flashMessagesService;

      sinon.stub(route, 'modelFor').returns(fakeAuthMethod);

      const controller = new (class extends Controller {})();
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
