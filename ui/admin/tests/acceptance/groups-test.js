import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
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

module('Acceptance | groups', function (hooks) {
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

  test('visiting groups', async function (assert) {
    assert.expect(1);
    await visit(urls.groups);
    await a11yAudit();
    assert.equal(currentURL(), urls.groups);
  });

  test('visiting a group', async function (assert) {
    assert.expect(1);
    await visit(urls.newGroup);
    await a11yAudit();
    assert.equal(currentURL(), urls.newGroup);
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

  test('can save changes to an existing group', async function (assert) {
    assert.expect(2);
    await visit(urls.group);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated admin group');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.group);
    assert.equal(this.server.db.groups[0].name, 'Updated admin group');
  });

  test('can cancel changes to an existing group', async function (assert) {
    assert.expect(1);
    await visit(urls.group);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated admin group');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Updated admin group');
  });

  test('can delete a group', async function (assert) {
    assert.expect(1);
    const groupsCount = this.server.db.groups.length;
    await visit(urls.group);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.groups.length, groupsCount - 1);
  });

  test('saving an existing group with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/groups/:id', () => {
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
    await visit(urls.group);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
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

  test('errors are displayed when delete project fails', async function (assert) {
    assert.expect(1);
    this.server.del('/groups/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });
    await visit(urls.group);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
