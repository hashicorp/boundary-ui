import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | smoke test', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /smoke-test', async function (assert) {
    await visit('/smoke-test');

    assert.equal(currentURL(), '/smoke-test');
  });
});
