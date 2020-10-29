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

module('Acceptance | host-catalogs | host sets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getHostSetCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      hostCatalog: null,
      host: null
    }
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hostSets: null,
    hostSet: null,
    unknownHostSet: null,
    newHostSet: null,
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
    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hostSets = `${urls.hostCatalog}/host-sets`;
    urls.hostSet = `${urls.hostSets}/${instances.hostSet.id}`;
    urls.unknownHostSet = `${urls.hostSets}/foo`;
    urls.newHostSet = `${urls.hostSets}/new`;
    // Generate resource couner
    getHostSetCount = () => this.server.schema.hostSets.all().models.length;
    authenticateSession({});
  });

  test('visiting host sets', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSets);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostSets);
    await visit(urls.hostSet);
    await a11yAudit();
    assert.equal(currentURL(), urls.hostSet);
  });

  test('visiting an unknown host set displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownHostSet);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('can create new host', async function (assert) {
    assert.expect(1);
    const count = getHostSetCount();
    await visit(urls.newHostSet);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getHostSetCount(), count + 1);
  });

  test('can cancel create new host', async function (assert) {
    assert.expect(2);
    const count = getHostSetCount();
    await visit(urls.newHostSet);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.hostSets);
    assert.equal(getHostSetCount(), count);
  });

  test('saving a new host set with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/host-sets', () => {
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
    await visit(urls.newHostSet);
    await click('[type="submit"]');
    assert.ok(find('[role="alert"]').textContent.trim(), 'The request was invalid.');
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can save changes to existing host', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.hostSet);
    assert.equal(this.server.schema.hostSets.all().models[0].name, 'random string');
  });

  test('can cancel changes to existing host', async function (assert) {
    assert.expect(2);
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.hostSet.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.hostSet.name);
  });

  test('saving an existing host set with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/host-sets/:id', () => {
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
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(find('[role="alert"]').textContent.trim(), 'The request was invalid.');
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved host set changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.hostSet);
    try {
      await visit(urls.hostSets);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.equal(currentURL(), urls.hostSets);
      assert.notEqual(this.server.schema.hostSets.all().models[0].name, 'random string');
    }
  });

  test('can cancel discard unsaved host set changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.hostSet.name, 'random string');
    await visit(urls.hostSet);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.hostSet);
    try {
      await visit(urls.hostSets);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.hostSet);
      assert.notEqual(this.server.schema.hostSets.all().models[0].name, 'random string');
    }
  });

  test('can delete host', async function (assert) {
    assert.expect(1);
    const count = getHostSetCount();
    await visit(urls.hostSet);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getHostSetCount(), count - 1);
  });

  test('can accept delete host set via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getHostSetCount();
    await visit(urls.hostSet);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getHostSetCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete host set via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getHostSetCount();
    await visit(urls.hostSet);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getHostSetCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a host set which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/host-sets/:id', () => {
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
    await visit(urls.hostSet);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });

});
