import { module, test } from 'qunit';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | scopes/scope/app-tokens', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    appTokens: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });

    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.appTokens = `${urls.orgScope}/app-tokens`;
  });

  test('visiting app-tokens page displays correct breadcrumb', async function (assert) {
    await visit(urls.appTokens);

    assert.strictEqual(
      currentURL(),
      urls.appTokens,
      'navigated to app-tokens page',
    );

    // Check that breadcrumb is rendered
    assert
      .dom('[data-test-breadcrumb]')
      .exists('Breadcrumb navigation is present');

    // Verify breadcrumb text
    assert
      .dom('[data-test-breadcrumb]')
      .hasText('App Tokens', 'Breadcrumb displays correct current page text');
  });
});
