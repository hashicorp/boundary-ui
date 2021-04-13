import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | origin', function (hooks) {
  setupTest(hooks);

  let service, ipcService;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:origin');
    ipcService = this.owner.lookup('service:ipc');
  });

  test('resets origin on error', async function (assert) {
    assert.expect(4);
    const ipcServiceStubbed = sinon.stub(ipcService, 'invoke');
    await service.setOrigin(window.location.origin);
    assert.equal(service.rendererOrigin, window.location.origin);
    assert.equal(service.adapter.host, window.location.origin);
    ipcServiceStubbed.withArgs('setOrigin').rejects();
    service.setOrigin('invalid-origin').catch(() => {
      assert.notOk(service.rendererOrigin);
      assert.equal(service.adapter.host, window.location.origin);
    });
  });

  test('drops trailing slashes from origin on setOrigin', async function (assert) {
    assert.expect(4);
    sinon.stub(ipcService, 'invoke');
    await service.setOrigin(`${window.location.origin}/`);
    assert.equal(service.rendererOrigin, window.location.origin);
    assert.equal(service.adapter.host, window.location.origin);
    await service.setOrigin(`${window.location.origin}//////`);
    assert.equal(service.rendererOrigin, window.location.origin);
    assert.equal(service.adapter.host, window.location.origin);
  });

  test('trim spaces from origin on setOrigin', async function (assert) {
    assert.expect(4);
    sinon.stub(ipcService, 'invoke');
    await service.setOrigin(` ${window.location.origin} `);
    assert.equal(service.rendererOrigin, window.location.origin);
    assert.equal(service.adapter.host, window.location.origin);
    await service.setOrigin(`   ${window.location.origin}   `);
    assert.equal(service.rendererOrigin, window.location.origin);
    assert.equal(service.adapter.host, window.location.origin);
  });
});
