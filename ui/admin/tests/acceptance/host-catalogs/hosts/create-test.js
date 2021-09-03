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

module('Acceptance | host-catalogs | hosts | create', function (hooks) {
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

  test('can create new host', async function (assert) {
    assert.expect(1);
    const count = getHostCount();
    await visit(urls.newHost);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getHostCount(), count + 1);
  });

  test('Users cannot create a new host without proper authorization', async function (assert) {
    assert.expect(2);
    instances.hostCatalog.authorized_collection_actions.hosts = [];
    await visit(urls.hostCatalog);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create'
      )
    );
    assert.notOk(find(`.rose-layout-page-actions [href="${urls.newHost}"]`));
  });
  test('Users can navigate to new host catalogs route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.hostCatalog);
    assert.ok(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create'
      )
    );
    assert.ok(find(`[href="${urls.hosts}"]`));
  });

  test('Users cannot navigate to new host catalogs route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.hostCatalog.authorized_collection_actions.hosts = [];
    await visit(urls.hostCatalog);
    assert.notOk(
      instances.hostCatalog.authorized_collection_actions.hosts.includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.hosts}"]`));
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
});
