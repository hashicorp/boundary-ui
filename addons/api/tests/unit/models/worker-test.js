/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | worker', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has a `createWorkerLed` method that targets a specific POST API', async function (assert) {
    assert.expect(2);

    const scopeId = 'global';
    const workerGeneratedAuthToken = 'token';
    this.server.post('/v1/workers:create:worker-led', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        scope_id: scopeId,
        worker_generated_auth_token: workerGeneratedAuthToken,
      });
      return { id: '123abc' };
    });

    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', {
      type: 'pki',
      scope: {
        scope_id: scopeId,
        type: 'global',
      },
    });
    await model.createWorkerLed(workerGeneratedAuthToken);
    const worker = store.peekRecord('worker', '123abc');
    assert.ok(worker);
  });
});
