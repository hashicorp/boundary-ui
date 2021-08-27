import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | groups | create', function (hooks) {
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

  test('can create new group', async function (assert) {
    assert.expect(1);
    const groupsCount = this.server.db.groups.length;
    await visit(urls.newGroup);
    await fillIn('[name="name"]', 'group name');
    await click('[type="submit"]');
    assert.equal(this.server.db.groups.length, groupsCount + 1);
  });

  test('can cancel new group creation', async function (assert) {
    assert.expect(2);
    const groupsCount = this.server.db.groups.length;
    await visit(urls.newGroup);
    await fillIn('[name="name"]', 'group name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.groups);
    assert.equal(this.server.db.groups.length, groupsCount);
  });

  test('saving a new group with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/groups', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.newGroup);
    await fillIn('[name="name"]', 'group name');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
