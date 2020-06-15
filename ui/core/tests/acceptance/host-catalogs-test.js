import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';

module('Acceptance | host catalogs', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting host catalogs', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    await visit('/orgs/1/projects/1/host-catalogs');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/projects/1/host-catalogs');
  });

  test('can navigate to host catalog form', async function(assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    await visit('/orgs/1/projects/1/host-catalogs');
    await click('main .rose-table-cell:first-child a');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/projects/1/host-catalogs/1');
  });

  test('can delete host catalog', async function(assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    assert.equal(this.server.db.hostCatalogs.length, 1);
    await visit('/orgs/1/projects/1/host-catalogs/1');
    await click('.rose-button-warning');
    assert.equal(this.server.db.hostCatalogs.length, 0);
  });

  test('can update host catalog and save changes', async function(assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    await visit('/orgs/1/projects/1/host-catalogs/1');
    await fillIn('[name="name"]', 'Test Name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.hostCatalogs[0].name, 'Test Name');
  });

  test('can update host catalog and cancel changes', async function(assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    await visit('/orgs/1/projects/1/host-catalogs/1');
    await fillIn('[name="name"]', 'Test Name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.hostCatalogs[0].name, 'Test Name');
  });

  test('can create host catalog and save changes', async function(assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    await visit('/orgs/1/projects/1/host-catalogs/new');
    await fillIn('[name="name"]', 'Test Name');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.hostCatalogs.length, 1);
    assert.equal(currentURL(), '/orgs/1/projects/1/host-catalogs/1');
  });

  test('can create host catalog and cancel changes', async function(assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    await visit('/orgs/1/projects/1/host-catalogs/new');
    await fillIn('[name="name"]', 'Test Name');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.hostCatalogs.length, 0);
    assert.equal(currentURL(), '/orgs/1/projects/1/host-catalogs');
  });

  test('errors are displayed when save host catalog fails', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    this.server.patch('/orgs/:org_id/projects/:project_id/host-catalogs/:id', () => {
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
    await visit('/orgs/1/projects/1/host-catalogs/1');
    await fillIn('[name="name"]', 'random string');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete host catalog fails', async function (assert) {
    assert.expect(1);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    this.server.del('/orgs/:org_id/projects/:project_id/host-catalogs/:id', () => {
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
    await visit('/orgs/1/projects/1/host-catalogs/1');
    await click('.rose-button-warning');
    await a11yAudit();
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('saving a new host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/orgs/:org_id/projects/:project_id/host-catalogs', () => {
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
    this.server.createList('project', 1);
    await visit('/orgs/1/projects/1/host-catalogs/new');
    await fillIn('[name="name"]', 'random string');
    await click('form [type="submit"]');
    await a11yAudit();
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

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.createList('project', 1);
    this.server.createList('host-catalog', 1);
    this.server.patch('/orgs/:org_id/projects/:project_id/host-catalogs/:id', () => {
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
    await visit('/orgs/1/projects/1/host-catalogs/1');
    await fillIn('[name="name"]', 'random string');
    await click('form [type="submit"]');
    await a11yAudit();
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
