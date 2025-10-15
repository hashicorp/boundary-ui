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

  test('invokes ipc to fetch rdp clients', async function (assert) {
    const ipcServiceStubbed = sinon.stub(ipcService, 'invoke');
    const rdpClients = [
      {
        value: 'mstsc',
        isAvailable: true,
      },
      {
        value: 'windows-app',
        isAvailable: false,
      },
      {
        value: 'none',
        isAvailable: true,
      },
    ];
    ipcServiceStubbed.withArgs('getRdpClients').resolves(rdpClients);
    const clients = await service.getRdpClients();
    assert.ok(ipcServiceStubbed.calledOnce, 'ipc invoke was called once');
    assert.deepEqual(
      clients,
      rdpClients,
      'rdp clients were returned correctly',
    );
  });

  test('invokes ipc to fetch preferred rdp client', async function (assert) {
    const ipcServiceStubbed = sinon.stub(ipcService, 'invoke');
    const preferredClient = 'mstsc';
    ipcServiceStubbed
      .withArgs('getPreferredRdpClient')
      .resolves(preferredClient);
    const client = await service.getPreferredRdpClient();
    assert.ok(ipcServiceStubbed.calledOnce, 'ipc invoke was called once');
    assert.deepEqual(
      client,
      preferredClient,
      'preferred rdp client was returned correctly',
    );
  });

  test('invokes ipc to set preferred rdp client', async function (assert) {
    const ipcServiceStubbed = sinon.stub(ipcService, 'invoke');
    const newPreferredClient = 'windows-app';
    ipcServiceStubbed
      .withArgs('setPreferredRdpClient', newPreferredClient)
      .resolves();
    const client = await service.setPreferredRdpClient(newPreferredClient);
    assert.ok(ipcServiceStubbed.calledOnce, 'ipc invoke was called once');
    assert.deepEqual(
      client,
      newPreferredClient,
      'preferred rdp client was set correctly',
    );
  });

  test('invokes ipc to launch rdp client', async function (assert) {
    const ipcServiceStubbed = sinon.stub(ipcService, 'invoke');
    const sessionId = 'session-123';
    ipcServiceStubbed.withArgs('launchRdpClient', sessionId).resolves();
    await service.launchRdpClient(sessionId, 'mstsc');
    assert.ok(ipcServiceStubbed.calledOnce, 'ipc invoke was called once');
    assert.ok(
      ipcServiceStubbed.calledWith('launchRdpClient', sessionId),
      'ipc invoke was called with correct arguments',
    );
  });
});
