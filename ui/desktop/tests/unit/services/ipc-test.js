/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { IPCRequest } from 'desktop/services/ipc';
import sinon from 'sinon';

module('Unit | Service | ipc', function (hooks) {
  setupTest(hooks);

  class MessageChannelMock {
    constructor() {
      this.port1.postMessage = this.port1.postMessage.bind(this);
      this.port2.postMessage = this.port2.postMessage.bind(this);
    }
    port1 = {
      postMessage() {},
      close() {},
    };
    port2 = {
      postMessage(data) {
        this.port1.onmessage({ data });
      },
      close() {},
    };
  }

  hooks.beforeEach(() => {
    // IPC requests talk to the main process indirectly via window.postMessage
    // proxy layer (mediated by preload.js).
    // But we don't want to send these for real in tests.
    sinon.stub(window, 'postMessage');
  });

  hooks.afterEach(() => {
    sinon.restore();
  });

  test('it creates new IPCRequest objects', function (assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:ipc');
    const request = service.invoke('hello', 'world', 'http://localhost:4200');
    assert.strictEqual(request.constructor, IPCRequest);
  });

  test('IPCRequest objects post messages on their window objects', function (assert) {
    assert.expect(2);
    const myWindow = {
      postMessage(request) {
        assert.strictEqual(request.method, 'hello');
        assert.strictEqual(request.payload, 'world');
      },
      MessageChannel: MessageChannelMock,
    };
    new IPCRequest('hello', 'world', myWindow);
  });

  test('IPCRequest objects resolve to the value posted via a response message port', async function (assert) {
    assert.expect(1);
    const myWindow = {
      postMessage(request, origin, [port]) {
        // Post back a message on the response port
        port.postMessage({
          foo: 'bar',
          test: 42,
        });
      },
      MessageChannel: MessageChannelMock,
    };
    const request = new IPCRequest('hello', 'world', myWindow);
    const response = await request;
    assert.deepEqual(response, {
      foo: 'bar',
      test: 42,
    });
  });

  test('IPCRequests reject if receiving an Error instance, where the rejection value is the parsed JSON Error message', async function (assert) {
    assert.expect(1);
    const stringifiedPayload = JSON.stringify({
      foo: 'bar',
      test: 42,
    });
    const myWindow = {
      postMessage(request, origin, [port]) {
        // Post back an error on the response port
        port.postMessage(new Error(stringifiedPayload));
      },
      MessageChannel: MessageChannelMock,
    };
    try {
      await new IPCRequest('hello', 'world', myWindow);
    } catch (e) {
      assert.deepEqual(e, {
        foo: 'bar',
        test: 42,
      });
    }
  });
});
