/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';
import sinon from 'sinon';
import {
  RDP_CLIENT_NONE,
  RDP_CLIENT_WINDOWS_APP,
  RDP_CLIENT_MSTSC,
} from 'desktop/services/rdp';

module('Unit | Service | rdp', function (hooks) {
  setupTest(hooks);

  let service, ipcService;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:rdp');
    ipcService = this.owner.lookup('service:ipc');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('getRdpClients sets to fallback value on error', async function (assert) {
    const ipcStub = sinon.stub(ipcService, 'invoke');
    ipcStub.withArgs('getRdpClients').rejects();
    ipcStub.withArgs('checkOS').resolves({ isMac: true });
    await service.getRdpClients();

    assert.deepEqual(
      service.rdpClients,
      [RDP_CLIENT_NONE],
      'rdpClients fallback is set correctly',
    );
    assert.deepEqual(
      service.recommendedRdpClient,
      {
        name: RDP_CLIENT_WINDOWS_APP,
        link: 'https://apps.apple.com/us/app/windows-app/id1295203466',
      },
      'recommendedRdpClient fallback is set correctly',
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
      RDP_CLIENT_NONE,
      'preferredRdpClient fallback is set correctly',
    );
  });

  test('setPreferredRdpClient sets to fallback value on error', async function (assert) {
    sinon
      .stub(ipcService, 'invoke')
      .withArgs('setPreferredRdpClient', RDP_CLIENT_MSTSC)
      .rejects();
    await service.setPreferredRdpClient(RDP_CLIENT_MSTSC);

    assert.strictEqual(
      service.preferredRdpClient,
      RDP_CLIENT_NONE,
      'preferredRdpClient fallback is set correctly',
    );
  });
});
