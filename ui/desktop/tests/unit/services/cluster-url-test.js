/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupDesktopContextBridgeApiMock } from '../../helpers/desktop-context-bridge-api-mock';

module('Unit | Service | clusterUrl', function (hooks) {
  setupTest(hooks);
  setupDesktopContextBridgeApiMock(hooks);

  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:clusterUrl');
  });

  test('keeps clusterUrl on error', async function (assert) {
    assert.expect(3);
    await service.setClusterUrl(window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);
    window.desktop.cluster.setClusterUrl.rejects();

    try {
      await service.setClusterUrl('http://other-origin');
    } catch {
      assert.strictEqual(service.adapter.host, window.location.origin);
      assert.true(
        window.desktop.cluster.setClusterUrl.calledWithExactly(
          'http://other-origin',
        ),
      );
    }
  });

  test('drops trailing slashes from clusterUrl on setClusterUrl', async function (assert) {
    assert.expect(4);
    await service.setClusterUrl(`${window.location.origin}/`);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.true(
      window.desktop.cluster.setClusterUrl.calledWithExactly(
        window.location.origin,
      ),
    );

    await service.setClusterUrl(`${window.location.origin}//////`);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.true(
      window.desktop.cluster.setClusterUrl.calledWithExactly(
        window.location.origin,
      ),
    );
  });

  test('trim spaces from clusterUrl on setClusterUrl', async function (assert) {
    assert.expect(4);
    await service.setClusterUrl(` ${window.location.origin}/ `);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.true(
      window.desktop.cluster.setClusterUrl.calledWithExactly(
        window.location.origin,
      ),
    );

    await service.setClusterUrl(`   ${window.location.origin}   `);
    assert.strictEqual(service.adapter.host, window.location.origin);
    assert.true(
      window.desktop.cluster.setClusterUrl.calledWithExactly(
        window.location.origin,
      ),
    );
  });

  test('resetClusterUrl clears adapter host and invokes IPC', async function (assert) {
    await service.setClusterUrl(window.location.origin);
    assert.strictEqual(service.adapter.host, window.location.origin);

    await service.resetClusterUrl();

    assert.strictEqual(service.adapter.host, undefined);
    assert.true(window.desktop.cluster.resetClusterUrl.calledOnce);
  });
});
