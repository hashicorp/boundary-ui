import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | onboarding | create-resources', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const urls = {
    createResources: '/onboarding/quick-setup/create-resources',
    successPath: '/onboarding/quick-setup/create-resources/success',
    hostCatalogPath: null,
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
    await click('[type="checkbox"]');
    await fillIn('[name="hostAddress"]', '0.0.0.0');
    await fillIn('[name="targetPort"]', '22');
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.successPath);
  });

  test('redirects user to host catalog screen when next is clicked', async function (assert) {
    assert.expect(1);
    await visit(urls.createResources);
    await click('[type="submit"]');
    const projectId = this.server.schema.scopes.where({ type: 'project' })
      .models[0].id;
    const hostCatalogId = this.server.schema.hostCatalogs.all().models[0].id;
    urls.hostCatalogPath = `/scopes/${projectId}/host-catalogs/${hostCatalogId}/hosts`;
    assert.strictEqual(currentURL(), urls.hostCatalogPath);
  });
});
