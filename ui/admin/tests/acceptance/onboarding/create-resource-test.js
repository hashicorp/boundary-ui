import { module, test } from 'qunit';
import { visit, currentURL, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | onboarding | create-resources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const urls = {
    createResources: '/scopes/global/onboarding/quick-setup/create-resources',
    successPath:
      '/scopes/global/onboarding/quick-setup/create-resources/success',
  };

  hooks.beforeEach(function () {
    authenticateSession({});
  });

  test('show hostAddress and targetPort fields when the checkbox is checked', async function (assert) {
    assert.expect(2);
    await visit(urls.createResources);
    await click('[type="checkbox"]');
    assert.ok(find('[name="hostAddress"]'));
    assert.ok(find('[name="targetPort"]'));
  });

  test('redirects user to success screen when next is clicked', async function (assert) {
    assert.expect(1);
    await visit(urls.createResources);
    await click('[type="submit"]');
    assert.equal(currentURL(), urls.successPath);
  });
});
