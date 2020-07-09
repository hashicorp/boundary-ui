import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';

module('Acceptance | projects', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    authenticateSession();
    this.server.create('org');
  });

  test('visiting an org index redirects to its projects', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    await visit('/orgs/1');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/projects');
  });

  test('visiting projects', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    await visit('/orgs/1/projects');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/projects');
  });

  test('can create new projects', async function (assert) {
    assert.expect(3);
    assert.equal(this.server.db.projects.length, 0);
    await visit('/orgs/1/projects/new');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(currentURL(), '/orgs/1/projects/1');
    assert.equal(this.server.db.projects.length, 1);
  });

  test('can cancel create new projects', async function (assert) {
    assert.expect(3);
    assert.equal(this.server.db.projects.length, 0);
    await visit('/orgs/1/projects/new');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), '/orgs/1/projects');
    assert.equal(this.server.db.projects.length, 0);
  });

  test('saving a new project with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/orgs/:org_id/projects', () => {
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
    await visit('/orgs/1/projects/new');
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

  test('can save changes to existing project', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1, { name: 'MyProject' });
    await visit('/orgs/1/projects/1');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), '/orgs/1/projects/1');
    assert.equal(this.server.db.projects[0].name, 'random string');
  });

  test('can cancel changes to existing project', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1, { name: 'MyProject' });
    await visit('/orgs/1/projects/1');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(find('[name="name"]').value, 'MyProject');
  });

  test('can delete project', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    assert.equal(this.server.db.projects.length, 1);
    await visit('/orgs/1/projects/1');
    await click('.rose-button-warning');
    assert.equal(this.server.db.projects.length, 0);
  });

  test('saving an existing project with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    this.server.patch('/orgs/:org_id/projects/:id', () => {
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
    await visit('/orgs/1/projects/1');
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
    this.server.createList('project', 1);
    this.server.patch('/orgs/:org_id/projects/:id', () => {
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
    await visit('/orgs/1/projects/1');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete project fails', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.del('/orgs/:org_id/projects/:id', () => {
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
    await visit('/orgs/1/projects/1');
    await click('.rose-button-warning');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
