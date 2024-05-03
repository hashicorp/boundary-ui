import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_HOST_CATALOG_STATIC } from 'api/models/host-catalog';

module(
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/hosts/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);

    let store;
    let controller;
    let getHostCount;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      hostCatalog: null,
      host: null,
    };

    const urls = {
      hosts: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/hosts/index',
      );

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
        scopeId: instances.scopes.project.id,
        scope: instances.scopes.project,
        type: TYPE_HOST_CATALOG_STATIC,
      });
      instances.host = this.server.create('host', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      urls.globalScope = `/scopes/global`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.hosts = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/hosts`;

      getHostCount = () => this.server.schema.hosts.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.hosts);
      const hostBefore = await store.findRecord('host', instances.host.id);
      hostBefore.name = 'test';

      assert.strictEqual(hostBefore.name, 'test');

      await controller.cancel(hostBefore);
      const hostAfter = await store.findRecord('host', instances.host.id);

      assert.notEqual(hostAfter.name, 'test');
      assert.deepEqual(hostAfter, hostBefore);
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.hosts);
      const hostBefore = await store.findRecord('host', instances.host.id);
      hostBefore.name = 'test';

      await controller.save(hostBefore);
      const hostAfter = await store.findRecord('host', instances.host.id);

      assert.strictEqual(hostAfter.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      await visit(urls.projectScope);
      const host = await store.findRecord('host', instances.host.id);
      const hostCount = getHostCount();

      await controller.delete(host);

      assert.strictEqual(getHostCount(), hostCount - 1);
    });
  },
);
