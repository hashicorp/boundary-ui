import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';

module('Acceptance | projects', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let org;
  let orgID;
  let projectsURL;
  let newProjectURL;
  let existingProject;
  let existingProjectURL;
  let getProjectScopesCount;
  let getFirstProjectScope;
  let initialProjectScopesCount;

  hooks.beforeEach(function () {
    org = this.server.create('scope', {type: 'org'}, 'withChildren');
    getProjectScopesCount = () => this.server.schema.scopes.where({type: 'project'}).length;
    getFirstProjectScope = () => this.server.schema.scopes.where({type: 'project'}).models[0];
    initialProjectScopesCount = getProjectScopesCount();
    orgID = org.id;
    projectsURL = `/scopes/${orgID}/projects`;
    newProjectURL = `/scopes/${orgID}/projects/new`;
    existingProject = getFirstProjectScope();
    existingProjectURL = `/scopes/${orgID}/projects/${existingProject.id}`;
  });

  test('visiting projects', async function (assert) {
    assert.expect(1);
    await visit(projectsURL);
    await a11yAudit();
    assert.equal(currentURL(), projectsURL);
  });

  test('visiting projects within a project scope redirects to the parent org scope', async function (assert) {
    assert.expect(2);
    const wrongProjectsURL = `/scopes/${existingProject.id}/projects`;
    assert.notEqual(wrongProjectsURL, projectsURL);
    await visit(wrongProjectsURL);
    await a11yAudit();
    assert.equal(currentURL(), projectsURL, 'Wrong projects path was redirected to correct path.');
  });

  test('can create new projects', async function (assert) {
    assert.expect(1);
    await visit(newProjectURL);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getProjectScopesCount(), initialProjectScopesCount + 1);
  });

  test('can cancel create new projects', async function (assert) {
    assert.expect(3);
    assert.equal(getProjectScopesCount(), initialProjectScopesCount);
    await visit(newProjectURL);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), projectsURL);
    assert.equal(getProjectScopesCount(), initialProjectScopesCount);
  });

  test('saving a new project with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/scopes', () => {
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
    await visit(newProjectURL);
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
    assert.expect(3);
    assert.notEqual(existingProject.name, 'random string');
    await visit(existingProjectURL);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), existingProjectURL);
    assert.equal(getFirstProjectScope().name, 'random string');
  });

  test('can cancel changes to existing project', async function (assert) {
    assert.expect(2);
    await visit(existingProjectURL);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(existingProject.name, 'random string');
    assert.equal(find('[name="name"]').value, existingProject.name);
  });

  test('can delete project', async function(assert) {
    assert.expect(1);
    await visit(existingProjectURL);
    await click('.rose-button-warning');
    assert.equal(getProjectScopesCount(), initialProjectScopesCount - 1);
  });

  test('saving an existing project with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/scopes/:id', () => {
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
    await visit(existingProjectURL);
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
    this.server.patch('/scopes/:id', () => {
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
    await visit(existingProjectURL);
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
    this.server.del('/scopes/:id', () => {
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
    await visit(existingProjectURL);
    await click('.rose-button-warning');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
