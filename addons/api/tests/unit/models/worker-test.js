import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | worker', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has an `addWorkerLed` method that targets a specific POST API', async function (assert) {
    assert.expect(2);
    this.server.post('/v1/workers:create:worker-led', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        worker_generated_auth_token: 'token',
      });
      return { id: '123abc' };
    });

    const store = this.owner.lookup('service:store');
    const model = store.createRecord('worker', { type: 'pki' });
    await model.addWorkerLed('token');
    const worker = store.peekRecord('worker', '123abc');
    assert.ok(worker);
  });
});
