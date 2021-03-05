import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { IPCRequest } from 'desktop/services/ipc';
import sinon from 'sinon';

module('Unit | Service | ipc', function (hooks) {
  setupTest(hooks);

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
    assert.equal(request.constructor, IPCRequest);
  });

  test('IPCRequest objects post messages on their window objects', function (assert) {
    assert.expect(2);
    const myWindow = {
      postMessage(request) {
        assert.equal(request.method, 'hello');
        assert.equal(request.payload, 'world');
      },
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
    };
    const request = new IPCRequest('hello', 'world', myWindow);
    const response = await request;
    assert.deepEqual(response, {
      foo: 'bar',
      test: 42,
    });
  });

  test('IPCRequests reject if receiving an Error instance, where the rejection value is the parsed JSON Error message', async (assert) => {
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
