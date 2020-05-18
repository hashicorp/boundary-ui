import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Acceptance | index', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function(assert) {
    assert.expect(1);
    await visit('/');
    await a11yAudit();
    assert.equal(currentURL(), '/');
  });
});
