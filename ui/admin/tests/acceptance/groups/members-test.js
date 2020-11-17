import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | groups | members', function (hooks) {
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
    members: null,
    addMembers: null,
  };
  let membersCount;

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create(
      'group',
      {
        scope: instances.scopes.org,
      },
      'withMembers'
    );
    membersCount = instances.group.memberIds.length;
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.members = `${urls.group}/members`;
    urls.addMembers = `${urls.group}/add-members`;
  });

  test('visiting group members', async function (assert) {
    assert.expect(2);
    await visit(urls.members);
    await a11yAudit();
    assert.equal(currentURL(), urls.members);
    assert.equal(findAll('tbody tr').length, membersCount);
  });

  test('can remove a member', async function (assert) {
    assert.expect(2);
    await visit(urls.members);
    assert.equal(findAll('tbody tr').length, membersCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, membersCount - 1);
  });

  test('shows error message on member remove', async function (assert) {
    assert.expect(2);
    this.server.post('/groups/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.members);
    assert.equal(findAll('tbody tr').length, membersCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });

  test('visiting member selection', async function (assert) {
    assert.expect(1);
    await visit(urls.addMembers);
    await a11yAudit();
    assert.equal(currentURL(), urls.addMembers);
  });

  test('select and save members to add', async function (assert) {
    assert.expect(3);
    instances.group.update({ memberIds: [] });
    await visit(urls.members);
    assert.equal(findAll('tbody tr').length, 0);
    await click('.rose-layout-page-actions a');
    assert.equal(currentURL(), urls.addMembers);
    // Click three times to select, unselect, then reselect (for coverage)
    await click('tbody label');
    await click('tbody label');
    await click('tbody label');
    await click('form [type="submit"]');
    await visit(urls.members);
    assert.equal(findAll('tbody tr').length, 1);
  });

  test('select and cancel members to add', async function (assert) {
    assert.expect(4);
    await visit(urls.members);
    assert.equal(findAll('tbody tr').length, membersCount);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, membersCount - 1);
    await click('.rose-layout-page-actions a');
    assert.equal(currentURL(), urls.addMembers);
    await click('tbody label');
    await click('form [type="button"]');
    await visit(urls.members);
    assert.equal(findAll('tbody tr').length, membersCount - 1);
  });

  test('shows error message on member add', async function (assert) {
    assert.expect(1);
    this.server.post('/groups/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    instances.group.update({ memberIds: [] });
    await visit(urls.addMembers);
    await click('tbody label');
    await click('form [type="submit"]');
    assert.ok(find('[role="alert"]'));
  });
});
