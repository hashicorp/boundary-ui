/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | clusterUrl', function (hooks) {
  setupTest(hooks);

  let service, ipcService, ipcStub;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:clusterUrl');
    ipcService = this.owner.lookup('service:ipc');
    ipcStub = sinon.stub(ipcService, 'invoke');
  });

  test('keeps clusterUrl on error', async function (assert) {
    assert.expect(3);
    await service.setClusterUrl(window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
    ipcStub.reset();

    ipcStub.withArgs('setClusterUrl').rejects();
    try {
      await service.setClusterUrl('http://other-origin');
    } catch {
      assert.strictEqual(service.adapter.host, window.location.origin);
      assert.ok(
        ipcStub.calledWithExactly('setClusterUrl', 'http://other-origin'),
      );
    }
  });

  test('drops trailing slashes from clusterUrl on setClusterUrl', async function (assert) {
    assert.expect(4);
    await service.setClusterUrl(`${window.location.origin}/`);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.ok(
      ipcStub.calledWithExactly('setClusterUrl', window.location.origin),
    );
    ipcStub.reset();

    await service.setClusterUrl(`${window.location.origin}//////`);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.ok(
      ipcStub.calledWithExactly('setClusterUrl', window.location.origin),
    );
  });

  test('trim spaces from clusterUrl on setClusterUrl', async function (assert) {
    assert.expect(4);
    await service.setClusterUrl(` ${window.location.origin}/ `);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.ok(
      ipcStub.calledWithExactly('setClusterUrl', window.location.origin),
    );
    ipcStub.reset();

    await service.setClusterUrl(`   ${window.location.origin}   `);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.ok(
      ipcStub.calledWithExactly('setClusterUrl', window.location.origin),
    );
  });

  test('resetClusterUrl clears adapter host and invokes IPC', async function (assert) {
    await service.setClusterUrl(window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
    ipcStub.reset();

    await service.resetClusterUrl();

    assert.strictEqual(service.adapter.host, undefined);
    assert.ok(ipcStub.calledWithExactly('resetClusterUrl'));
  });
});
