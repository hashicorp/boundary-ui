/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';
import sinon from 'sinon';

module('Unit | Service | rdp', function (hooks) {
  setupTest(hooks);

  let service, ipcService;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:rdp');
    ipcService = this.owner.lookup('service:ipc');
  });

  test('getRdpClients sets to fallback value on error', async function (assert) {
    sinon.stub(ipcService, 'invoke').withArgs('getRdpClients').rejects();
    await service.getRdpClients();
    assert.deepEqual(
      service.rdpClients,
      [{ value: 'none' }],
      'rdpClients fallback is set correctly',
    );
  });

  test('getPreferredRdpClient sets to fallback value on error', async function (assert) {
    sinon
      .stub(ipcService, 'invoke')
      .withArgs('getPreferredRdpClient')
      .rejects();
    await service.getPreferredRdpClient();
    assert.strictEqual(
      service.preferredRdpClient,
      'none',
      'preferredRdpClient fallback is set correctly',
    );
  });

  test('setPreferredRdpClient sets to fallback value on error', async function (assert) {
    sinon
      .stub(ipcService, 'invoke')
      .withArgs('setPreferredRdpClient', 'mstsc')
      .rejects();
    await service.setPreferredRdpClient('mstsc');
    assert.strictEqual(
      service.preferredRdpClient,
      'none',
      'preferredRdpClient fallback is set correctly',
    );
  });
});
