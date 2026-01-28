/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | clusterUrl', function (hooks) {
  setupTest(hooks);

  let service, ipcService;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:clusterUrl');
    ipcService = this.owner.lookup('service:ipc');
  });

  test('resets clusterUrl on error', async function (assert) {
    assert.expect(4);
    const ipcServiceStubbed = sinon.stub(ipcService, 'invoke');
    await service.setClusterUrl(window.location.origin);
    assert.strictEqual(service.rendererClusterUrl, window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
    ipcServiceStubbed.withArgs('setClusterUrl').rejects();
    service.setClusterUrl('invalid-origin').catch(() => {
      assert.notOk(service.rendererClusterUrl);
      assert.strictEqual(service.adapter.host, window.location.origin);
    });
  });

  test('drops trailing slashes from clusterUrl on setClusterUrl', async function (assert) {
    assert.expect(4);
    sinon.stub(ipcService, 'invoke');
    await service.setClusterUrl(`${window.location.origin}/`);
    assert.strictEqual(service.rendererClusterUrl, window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
    await service.setClusterUrl(`${window.location.origin}//////`);
    assert.strictEqual(service.rendererClusterUrl, window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
  });

  test('trim spaces from clusterUrl on setClusterUrl', async function (assert) {
    assert.expect(4);
    sinon.stub(ipcService, 'invoke');
    await service.setClusterUrl(` ${window.location.origin}/ `);
    assert.strictEqual(service.rendererClusterUrl, window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
    await service.setClusterUrl(`   ${window.location.origin}   `);
    assert.strictEqual(service.rendererClusterUrl, window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
  });
});
