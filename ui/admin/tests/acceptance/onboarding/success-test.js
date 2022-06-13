import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Acceptance | onboarding | quick-setup | create-resources | success',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
      authenticateSession({});
    });

    const urls = {
      createResources: '/onboarding/quick-setup/create-resources/success',
      targets: '/scopes/global/targets',
    };

    test.skip('clicking done takes user to targets screen', async function (assert) {
      assert.expect(1);
      await visit(urls.createResources);
      await click('.success-button');
      assert.equal(currentURL(), urls.targets);
    });
  }
);
