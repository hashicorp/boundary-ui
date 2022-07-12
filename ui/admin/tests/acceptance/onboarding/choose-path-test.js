import { module, test } from 'qunit';
import { visit, currentURL, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | onboarding | choose-path', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const urls = {
    choosePath: '/onboarding/quick-setup/choose-path',
    newOrg: '/scopes/global/new',
    createResources: '/onboarding/quick-setup/create-resources',
  };

  hooks.beforeEach(function () {
    authenticateSession({});
  });

  test('defaults to the guided path', async function (assert) {
    assert.expect(2);
    await visit(urls.choosePath);
    assert.strictEqual(find('input[name=paths]:checked').value, 'guided');
    assert.false(find('input[value=manual]').checked);
  });

  test('updates to the manual path when manual card clicked', async function (assert) {
    assert.expect(2);
    await visit(urls.choosePath);
    await click('[name="paths"][value="manual"]');
    assert.strictEqual(find('input[name=paths]:checked').value, 'manual');
    assert.false(find('input[value=guided]').checked);
  });

  test('guided path directs user to /create-resources route', async function (assert) {
    assert.expect(1);
    await visit(urls.choosePath);
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.createResources);
  });

  test('guided path directs user to /global/new route', async function (assert) {
    assert.expect(1);
    await visit(urls.choosePath);
    await click('[name="paths"][value="manual"]');
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.newOrg);
  });
});
