import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | worker', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('worker', {});
    assert.ok(model);
  });

  test('it has an `addWorkerLed` method that targets a specific POST API', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/workers/123abc:create:worker-led',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        console.log(request);
        assert.deepEqual(body, {
          name: 'Worker',
          description: 'Description',
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'worker',
        attributes: {
          name: 'Worker',
          description: 'Description',
        },
      },
    });
    const model = store.peekRecord('worker', '123abc');
    console.log(model);
    await model.addWorkerLed();
  });
});
