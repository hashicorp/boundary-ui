import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };
  const urls = {
    orgScopeEdit: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    // Generate route URLs for resources
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    // Generate resource couner
    authenticateSession({});
  });

  test('visiting org scope edit', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScopeEdit);
    await a11yAudit();
    assert.equal(currentURL(), urls.orgScopeEdit);
    assert.ok(find('main .rose-form'));
  });

  test('visiting org scope edit without read permission results in no form displayed', async function (assert) {
    assert.expect(2);
    instances.scopes.org.update({ authorized_actions: [] });
    await visit(urls.orgScopeEdit);
    assert.equal(currentURL(), urls.orgScopeEdit);
    assert.notOk(find('main .rose-form'));
  });
});
