import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/host-catalogs/host-catalog/host-sets/host-set/create-and-add-host',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      hostCatalog: null,
      hostSet: null,
      host: null,
    };

    const urls = {
      createAndAddhost: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/host-catalogs/host-catalog/host-sets/host-set/create-and-add-host',
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
      });
      instances.hostSet = this.server.create('host-set', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      instances.host = this.server.create('host', {
        scopeId: instances.scopes.project.id,
        hostCatalog: instances.hostCatalog,
      });
      urls.globalScope = `/scopes/global`;
      urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.createAndAddhost = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/host-sets/${instances.hostSet.id}/create-and-add-host`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.createAndAddhost);
      const hostBefore = await store.findRecord('host', instances.host.id);
      hostBefore.name = 'test';

      assert.strictEqual(hostBefore.name, 'test');

      await controller.cancel(hostBefore);
      const hostAfter = await store.findRecord('host', instances.host.id);

      assert.notEqual(hostAfter.name, 'test');
      assert.deepEqual(hostAfter, hostBefore);
    });

    test('save action saves host and adds to the specified host-set', async function (assert) {
      await visit(urls.createAndAddhost);
      const hostSetBefore = await store.findRecord(
        'host-set',
        instances.hostSet.id,
      );
      const hostBefore = await store.findRecord('host', instances.host.id);
      hostBefore.name = 'test';

      assert.deepEqual(hostSetBefore.host_ids, []);

      await controller.save(hostBefore);
      const hostAfter = await store.findRecord('host', instances.host.id);
      const hostSetAfter = await store.findRecord(
        'host-set',
        instances.hostSet.id,
      );

      assert.strictEqual(hostAfter.name, 'test');
      assert.deepEqual(hostSetAfter.host_ids, [instances.host.id]);
    });
  },
);
