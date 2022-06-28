import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
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

    test('check if the done button is present', async function (assert) {
      assert.expect(1);
      await visit(urls.createResources);
      assert.ok(find('.onboarding-quick-setup-success-button'));
    });
  }
);
