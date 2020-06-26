import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | index', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting / redirects to /orgs/authenticate', async function (assert) {
    assert.expect(1);
    await visit('/');
    assert.equal(currentURL(), '/orgs/authenticate');
  });
});
