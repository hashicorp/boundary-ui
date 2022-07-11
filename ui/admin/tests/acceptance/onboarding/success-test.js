import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
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
      createResources: '/onboarding/quick-setup/create-resources',
      successPath: '/onboarding/quick-setup/create-resources/success',
      targetsPath: null,
    };

    test('check if the done button is present', async function (assert) {
      assert.expect(1);
      await visit(urls.successPath);
      assert.ok(find('.onboarding-quick-setup-success-button'));
    });

    test('check if the controller url is copyable', async function (assert) {
      assert.expect(2);
      await visit(urls.successPath);
      assert.ok(find('.copyable'));
      assert.strictEqual(
        find('.copyable-button').textContent.trim(),
        'Copy to Clipboard'
      );
    });

    test('redirect user to targets list when done is clicked', async function (assert) {
      assert.expect(1);
      await visit(urls.createResources);
      await click('[type="checkbox"]');
      await fillIn('[name="hostAddress"]', '0.0.0.0');
      await fillIn('[name="targetPort"]', '22');
      await click('[type="submit"]');
      const projectId = this.server.schema.scopes.where({ type: 'project' })
        .models[0].id;
      await visit(urls.successPath);
      await click('.onboarding-quick-setup-success-button');
      urls.targetsPath = `/scopes/${projectId}/targets`;
      assert.strictEqual(currentURL(), urls.targetsPath);
    });
  }
);
