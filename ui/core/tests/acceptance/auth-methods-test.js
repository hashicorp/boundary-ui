import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | auth-methods', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    authenticateSession();
    this.server.create('org');
  });

  test('visiting auth-methods', async function (assert) {
    assert.expect(1);
    await visit('/orgs/1/auth-methods');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/auth-methods');
  });
});
