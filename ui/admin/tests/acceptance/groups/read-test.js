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

module('Acceptance | groups | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    group: null,
  };
  const urls = {
    orgScope: null,
    groups: null,
    group: null,
    newGroup: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create('group', {
      scope: instances.scopes.org,
    });
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.newGroup = `${urls.groups}/new`;
  });

  test('visiting a group', async function (assert) {
    assert.expect(1);
    await visit(urls.newGroup);
    await a11yAudit();
    assert.equal(currentURL(), urls.newGroup);
  });

  test('cannot navigate to a group form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.group.authorized_actions =
      instances.group.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.group);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });
});
