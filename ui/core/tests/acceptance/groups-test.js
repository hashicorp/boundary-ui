import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';


module('Acceptance | groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('org');
  });

  test('visiting groups', async function (assert) {
    assert.expect(1);
    await visit('/orgs/1/groups');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/groups');
  });

  test('can create new group', async function (assert) {
    assert.expect(4);
    assert.equal(this.server.db.groups.length, 0);
    await visit('/orgs/1/groups/new');
    await fillIn('[name="name"]', 'group name');
    await click('[type="submit"]');
    assert.equal(currentURL(), '/orgs/1/groups/1');
    assert.equal(this.server.db.groups.length, 1);
    assert.equal(this.server.db.groups[0].name, 'group name');
  });

  test('can cancel new group creation', async function (assert) {
    assert.expect(3);
    assert.equal(this.server.db.groups.length, 0);
    await visit('/orgs/1/groups/new');
    await fillIn('[name="name"]', 'group name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), '/orgs/1/groups');
    assert.equal(this.server.db.groups.length, 0);
  });

  test('saving a new group with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/orgs/:org_id/groups', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            fields: [
              {
                name: 'name',
                message: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit('/orgs/1/groups/new');
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
    this.server.createList('group', 1, {name: 'Admin group'});
    await visit('/orgs/1/groups/1');
    await fillIn('[name="name"]', 'Updated admin group');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), '/orgs/1/groups/1');
    assert.equal(this.server.db.groups[0].name, 'Updated admin group');
  });

  test('can cancel changes to an existing group', async function (assert) {
    assert.expect(1);
    this.server.createList('group', 1, {name: 'Admin group'});
    await visit('/orgs/1/groups/1');
    await fillIn('[name="name"]', 'Updated admin group');
    await click('.rose-form-actions [type="button"]');
    assert.equal(find('[name="name"]').value, 'Admin group');
  });

  test('can delete a group', async function(assert) {
    assert.expect(2);
    this.server.createList('group', 1);
    assert.equal(this.server.db.groups.length, 1);
    await visit('/orgs/1/groups/1');
    await click('.rose-button-warning');
    assert.equal(this.server.db.groups.length, 0);
  });

  test('saving an existing group with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.createList('group', 1);
    this.server.patch('/orgs/:org_id/groups/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            fields: [
              {
                name: 'name',
                message: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit('/orgs/1/groups/1');
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

  test('errors are displayed when save project fails', async function (assert) {
    assert.expect(1);
    this.server.createList('group', 1);
    this.server.patch('/orgs/:org_id/groups/:id', () => {
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
    await visit('/orgs/1/groups/1');
    await fillIn('[name="name"]', 'Role name');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete project fails', async function (assert) {
    assert.expect(1);
    this.server.createList('group', 1);
    this.server.del('/orgs/:org_id/groups/:id', () => {
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
    await visit('/orgs/1/groups/1');
    await click('.rose-button-warning');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
