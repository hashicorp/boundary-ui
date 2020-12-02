import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { IPCRequest } from 'desktop/services/ipc';
import sinon from 'sinon';

module('Unit | Service | ipc', function (hooks) {
  setupTest(hooks);

  test('it creates new IPCRequest objects', async function (assert) {
    assert.expect(1);
    sinon.stub(window, 'postMessage').callsFake((request, origin, [port]) => {
      port.postMessage({});
    });
    const service = this.owner.lookup('service:ipc');
    const request = service.invoke('hello', 'world');
    assert.equal(request.constructor, IPCRequest);
  });

  test('IPCRequest objects post messages on their window objects', async function (assert) {
    assert.expect(2);
    const myWindow = {
      postMessage(request, origin, [port]) {
        assert.equal(request.method, 'hello');
        assert.equal(request.payload, 'world');
        port.postMessage({});
      },
    };
    new IPCRequest('hello', 'world', null, myWindow);
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
    const request = new IPCRequest('hello', 'world', null, myWindow);
    const response = await request;
    assert.deepEqual(response, {
      foo: 'bar',
      test: 42,
    });
  });

  test('IPCRequest objects reject if a timeout duration elapses', async function (assert) {
    assert.expect(1);
    const myWindow = {
      postMessage(/*request, origin, [port]*/) {
        // ...do nothing in order to trigger a timeout
      },
    };
    const request = new IPCRequest('hello', 'world', 1, myWindow);
    request.catch(() => {
      assert.ok(true, 'Request rejected.');
    });
  });
});
