/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'admin/tests/helpers';
import Service from '@ember/service';
import sinon from 'sinon';
import Store from 'ember-data/store';

module('Unit | Service | store', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register(
      'service:flash-messages',
      class extends Service {
        warning() {
          return { getFlashObject: () => ({ message: null }) };
        }
      },
    );

    this.owner.register(
      'service:intl',
      class extends Service {
        t(key) {
          return key;
        }
      },
    );

    this.owner.register(
      'service:router',
      class extends Service {
        refresh() {}
      },
    );
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:store');
    assert.ok(service);
  });

  test('query returns result and does not trigger countdown when there is no rate-limit warning', async function (assert) {
    const store = this.owner.lookup('service:store');
    const fakeResult = { items: [], meta: {} };

    sinon.stub(Store.prototype, 'query').resolves(fakeResult);
    const performSpy = sinon.spy(store._countdownTask, 'perform');

    const result = await store.query('group', {});

    assert.deepEqual(result, fakeResult);
    assert.ok(performSpy.notCalled);
  });

  test('query triggers _countdownTask with retryAfter when result has rateLimitWarning', async function (assert) {
    const store = this.owner.lookup('service:store');
    const fakeResult = {
      items: [{ id: 'g_1' }],
      meta: { rateLimitWarning: { retryAfter: 30 } },
    };

    sinon.stub(Store.prototype, 'query').resolves(fakeResult);
    const performStub = sinon
      .stub(store._countdownTask, 'perform')
      .returns(Promise.resolve());

    const result = await store.query('group', {});

    assert.deepEqual(result, fakeResult);
    assert.ok(performStub.calledOnceWith(30));
  });
});
