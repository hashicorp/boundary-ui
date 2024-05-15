import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/targets/target/add-host-sources',
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
      target: null,
      hostSet: null,
    };

    const urls = {
      projectScope: null,
      addHostSources: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-host-sources',
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
      instances.target = this.server.create('target', {
        scope: instances.scopes.project,
      });
      instances.hostSet = this.server.create('host-set', {
        scope: instances.scopes.project,
      });

      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.addHostSources = `${urls.projectScope}/targets/${instances.target.id}/add-host-sources`;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
    });

    test('save action saves host sources on the specified model', async function (assert) {
      await visit(urls.addHostSources);
      const target = await store.findRecord('target', instances.target.id);

      assert.deepEqual(target.host_sources, []);

      await controller.save(target, [instances.hostSet.id]);

      assert.deepEqual(target.host_sources, [
        { host_source_id: instances.hostSet.id },
      ]);
    });
  },
);
