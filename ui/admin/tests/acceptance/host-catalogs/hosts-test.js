import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | host-catalogs | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getHostCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null,
    host: null,
    unknownHost: null,
    newHost: null,
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
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.host = `${urls.hosts}/${instances.host.id}`;
    urls.unknownHost = `${urls.hosts}/foo`;
    urls.newHost = `${urls.hosts}/new`;
    // Generate resource couner
    getHostCount = () => this.server.schema.hosts.all().models.length;
    authenticateSession({});
  });

  test('visiting hosts', async function (assert) {
    assert.expect(2);
    await visit(urls.hosts);
    await a11yAudit();
    assert.equal(currentURL(), urls.hosts);
    await visit(urls.host);
    await a11yAudit();
    assert.equal(currentURL(), urls.host);
  });

  test('visiting an unknown host displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownHost);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('can create new host', async function (assert) {
    assert.expect(1);
    const count = getHostCount();
    await visit(urls.newHost);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getHostCount(), count + 1);
  });

  test('can cancel create new host', async function (assert) {
    assert.expect(2);
    const count = getHostCount();
    await visit(urls.newHost);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.hosts);
    assert.equal(getHostCount(), count);
  });

  test('saving a new host with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/hosts', () => {
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
    await visit(urls.newHost);
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

  test('can save changes to existing host', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.host.name, 'random string');
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.host);
    assert.equal(
      this.server.schema.hosts.all().models[0].name,
      'random string'
    );
  });

  test('can cancel changes to existing host', async function (assert) {
    assert.expect(2);
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.host.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.host.name);
  });

  test('saving an existing host with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/hosts/:id', () => {
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
    await visit(urls.host);
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

  test('can discard unsaved host changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.host.name, 'random string');
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.host);
    try {
      await visit(urls.hosts);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.equal(currentURL(), urls.hosts);
      assert.notEqual(
        this.server.schema.hosts.all().models[0].name,
        'random string'
      );
    }
  });

  test('can cancel discard unsaved host changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.host.name, 'random string');
    await visit(urls.host);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.host);
    try {
      await visit(urls.hosts);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.host);
      assert.notEqual(
        this.server.schema.hosts.all().models[0].name,
        'random string'
      );
    }
  });

  test('can delete host', async function (assert) {
    assert.expect(1);
    const count = getHostCount();
    await visit(urls.host);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getHostCount(), count - 1);
  });

  test('can accept delete host via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getHostCount();
    await visit(urls.host);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getHostCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete host via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getHostCount();
    await visit(urls.host);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getHostCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a host which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/hosts/:id', () => {
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
    await visit(urls.host);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
