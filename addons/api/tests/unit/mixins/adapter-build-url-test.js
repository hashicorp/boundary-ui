/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import RESTAdapter from '@ember-data/adapter/rest';
/* eslint-disable-next-line ember/no-mixins */
import AdapterBuildURLMixin from 'api/mixins/adapter-build-url';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | build-url', function (hooks) {
  setupTest(hooks);

  test('it does not interfere with basic URLs', function (assert) {
    /* eslint-disable-next-line ember/no-new-mixins, ember/no-classic-classes */
    const Adapter = RESTAdapter.extend(AdapterBuildURLMixin);
    this.owner.register('adapter:adapter', Adapter);
    const adapter = this.owner.lookup('adapter:adapter');
    const url = adapter._buildURL('model', 1);
    assert.strictEqual(url, '/models/1');
  });

  test('it does not interfere with namespaced URLs', function (assert) {
    /* eslint-disable-next-line ember/no-new-mixins, ember/no-classic-classes */
    const Adapter = RESTAdapter.extend(AdapterBuildURLMixin, {
      namespace: 'api/v1',
    });
    this.owner.register('adapter:adapter', Adapter);
    const adapter = this.owner.lookup('adapter:adapter');
    const url = adapter._buildURL('model', 1);
    assert.strictEqual(url, '/api/v1/models/1');
  });

  test('it can prepend a prefix', function (assert) {
    /* eslint-disable-next-line ember/no-new-mixins, ember/no-classic-classes */
    const Adapter = RESTAdapter.extend(AdapterBuildURLMixin, {
      urlPrefix() {
        return '/foo/bars';
      },
    });
    this.owner.register('adapter:adapter', Adapter);
    const adapter = this.owner.lookup('adapter:adapter');
    const url = adapter._buildURL('model', 1);
    assert.strictEqual(url, '/foo/bars/models/1');
  });

  test('it can append a suffix', function (assert) {
    /* eslint-disable-next-line ember/no-new-mixins, ember/no-classic-classes */
    const Adapter = RESTAdapter.extend(AdapterBuildURLMixin, {
      urlSuffix() {
        return ':method';
      },
    });
    this.owner.register('adapter:adapter', Adapter);
    const adapter = this.owner.lookup('adapter:adapter');
    const url = adapter._buildURL('model', 1);
    assert.strictEqual(url, '/models/1:method');
  });
});
