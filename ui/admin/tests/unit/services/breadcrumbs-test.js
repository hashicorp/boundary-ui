/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';

module('Unit | Service | breadcrumbs', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:breadcrumbs');
    assert.ok(service);
  });

  test('registerContainer properly adds a new container', function (assert) {
    const container = { element: 'element' };
    const service = this.owner.lookup('service:breadcrumbs');

    service.registerContainer(container);

    assert.strictEqual(service.containers[0].element, container.element);
  });

  test('unregisterContainer properly removes an existing container', function (assert) {
    const container = { element: 'element' };
    const service = this.owner.lookup('service:breadcrumbs');

    service.registerContainer(container);
    service.unregisterContainer(container);

    assert.strictEqual(service.containers.length, 0);
  });
});
