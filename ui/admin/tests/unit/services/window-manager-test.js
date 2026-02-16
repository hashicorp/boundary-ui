/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import Service from '@ember/service';

module('Unit | Service | window-manager', function (hooks) {
  setupTest(hooks);
  setupBrowserFakes(hooks, { window: true });

  test('it opens window instances', function (assert) {
    assert.expect(1);
    const fakeURL = 'bloop://not-a-real-url';
    // Register mock window service
    this.owner.register(
      'service:browser/window',
      class extends Service {
        open(url) {
          assert.strictEqual(url, fakeURL);
        }
      },
    );
    const service = this.owner.lookup('service:window-manager');
    service.open(fakeURL);
  });

  test('it closes all open window instances and _does not_ close already-closed instances', function (assert) {
    const instanceCount = 3;
    const assertionsPerInstance = 1;
    assert.expect(instanceCount * assertionsPerInstance);
    // Register mock window service
    this.owner.register(
      'service:browser/window',
      class extends Service {
        open() {
          return {
            close() {
              assert.ok(true, 'Window closed.');
            },
          };
        }
      },
    );
    const service = this.owner.lookup('service:window-manager');
    for (let i = 0; i < instanceCount; i++) {
      service.open();
    }
    // First, close all open instances.
    service.closeAll();
    // Try closeAll again, which should result in no additional assertions.
    // See assert.expect above, which accounts for a single close call
    // per instance.
    service.closeAll();
  });
});
