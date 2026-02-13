/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';
import sinon from 'sinon';
import {
  RDP_CLIENT_NONE,
  RDP_CLIENT_WINDOWS_APP,
  RDP_CLIENT_MSTSC,
  RDP_CLIENT_WINDOWS_APP_LINK,
  RDP_CLIENT_MSTSC_LINK,
} from 'desktop/services/rdp';
import { setupBoundaryApiMock } from '../../helpers/boundary-api-mock';

module('Unit | Service | rdp', function (hooks) {
  setupTest(hooks);
  setupBoundaryApiMock(hooks);

  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:rdp');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('getRdpClients sets to fallback value on error', async function (assert) {
    sinon.stub(window.boundary, 'getRdpClients').rejects();
    sinon.stub(window.boundary, 'checkOS').resolves({ isMac: true });
    await service.getRdpClients();

    assert.deepEqual(
      service.rdpClients,
      [RDP_CLIENT_NONE],
      'rdpClients fallback is set correctly',
    );
  });

  test('getPreferredRdpClient sets to fallback value on error', async function (assert) {
    sinon.stub(window.boundary, 'getPreferredRdpClient').rejects();
    await service.getPreferredRdpClient();

    assert.strictEqual(
      service.preferredRdpClient,
      RDP_CLIENT_NONE,
      'preferredRdpClient fallback is set correctly',
    );
  });

  test('setPreferredRdpClient sets to fallback value on error', async function (assert) {
    sinon.stub(window.boundary, 'setPreferredRdpClient').rejects();
    await service.setPreferredRdpClient(RDP_CLIENT_MSTSC);

    assert.strictEqual(
      service.preferredRdpClient,
      RDP_CLIENT_NONE,
      'preferredRdpClient fallback is set correctly',
    );
  });

  test('sets recommendedRdpClient correctly based on OS', async function (assert) {
    const checkOSStub = sinon
      .stub(window.boundary, 'checkOS')
      .resolves({ isWindows: true });
    await service.getRecommendedRdpClient();

    assert.deepEqual(
      service.recommendedRdpClient,
      {
        name: RDP_CLIENT_MSTSC,
        link: RDP_CLIENT_MSTSC_LINK,
      },
      'recommendedRdpClient is set correctly for windows',
    );

    checkOSStub.resolves({ isMac: true });
    service.recommendedRdpClient = null;
    await service.getRecommendedRdpClient();

    assert.deepEqual(
      service.recommendedRdpClient,
      {
        name: RDP_CLIENT_WINDOWS_APP,
        link: RDP_CLIENT_WINDOWS_APP_LINK,
      },
      'recommendedRdpClient is set correctly for mac',
    );
  });
});
