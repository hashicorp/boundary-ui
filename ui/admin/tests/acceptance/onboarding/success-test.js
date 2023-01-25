import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

// What to test:
// - Check links open on new tab/window.
// - Check the controller URL is copyable.
// - Redirect user to target when done is clicked

module('Acceptance | onboarding | success', function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(function () {
      authenticateSession({});
    });

    const urls = {
      createResources: '/onboarding/quick-setup/create-resources',
      successPath: '/onboarding/quick-setup/create-resources/success',
      targetsPath: null,
      onboarding: '/onboarding',
      success: '/onboarding/success',
    };
    const doneButtonSelector = '[data-test-onboarding-done-button]';

    test('check if the done button is present', async function (assert) {
      assert.expect(1);
      await visit(urls.success);
      assert.dom(doneButtonSelector).isVisible();
    });

    test.skip('check the controller url is copyable', async function (assert) {
      assert.strictEqual(find('.copyable-content').textContent.trim(), 'http://localhost:7357');
    });

    test.skip('check if the controller url is copyable', async function (assert) {
      assert.expect(2);
      await visit(urls.successPath);
      assert.ok(find('.copyable'));
      assert.strictEqual(
        find('.copyable-button').textContent.trim(),
        'Copy to Clipboard'
      );
    });

    test.skip('redirect user to targets details when done is clicked', async function (assert) {
      assert.expect(1);
      await visit(urls.createResources);
      await click('[type="checkbox"]');
      await fillIn('[name="targetAddress"]', '0.0.0.0');
      await fillIn('[name="targetPort"]', '22');
      await click('[type="submit"]');
      const projectId = this.server.db.scopes.where({ type: 'project' })[0].id;
      const targetId = this.server.db.targets[0].id;
      await visit(urls.successPath);
      await click('.onboarding-quick-setup-success-button');
      urls.targetsPath = `/scopes/${projectId}/targets/${targetId}`;
      assert.strictEqual(currentURL(), urls.targetsPath);
    });
  }
);
