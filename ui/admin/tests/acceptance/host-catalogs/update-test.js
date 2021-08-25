import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | update', function (hooks) {
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
    hostCatalogs: null,
    hostCatalog: null,
    newHostCatalog: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.unknownHostCatalog = `${urls.hostCatalogs}/foo`;
    urls.newHostCatalog = `${urls.hostCatalogs}/new`;
    authenticateSession({});
  });

  test('can save changes to existing host catalog', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.hostCatalog);
    assert.equal(
      this.server.schema.hostCatalogs.all().models[0].name,
      'random string'
    );
  });

  test('cannot make changes to an existing host catalog without proper authorization', async function (assert) {
    assert.expect(1);
    instances.hostCatalog.authorized_actions =
      instances.hostCatalog.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.hostCatalog);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to existing host catalog', async function (assert) {
    assert.expect(2);
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.hostCatalog.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.hostCatalog.name);
  });

  test('saving an existing host catalog with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/host-catalogs/:id', () => {
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
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved host catalog changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.hostCatalog);
    try {
      await visit(urls.hostCatalogs);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.equal(currentURL(), urls.hostCatalogs);
      assert.notEqual(
        this.server.schema.hostCatalogs.all().models[0].name,
        'random string'
      );
    }
  });

  test('can cancel discard unsaved host catalog changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostCatalog.name, 'random string');
    await visit(urls.hostCatalog);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.hostCatalog);
    try {
      await visit(urls.hostCatalogs);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.hostCatalog);
      assert.notEqual(
        this.server.schema.hostCatalogs.all().models[0].name,
        'random string'
      );
    }
  });
});
