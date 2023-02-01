import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC } from 'api/models/credential-library';

module('Unit | Model | credential library', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('credential-library', {});
    assert.ok(model);
  });

  test('it has isUnknown property and returns the expected values', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const modelA = store.createRecord('credential-library', {
      type: TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
    });
    const modelB = store.createRecord('credential-library', {
      type: 'unknown',
    });

    assert.false(modelA.isUnknown);
    assert.true(modelB.isUnknown);
  });
});
