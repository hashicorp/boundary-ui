/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/targets/target/add-host-sources',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);

    let store;
    let controller;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      target: null,
      hostCatalog: null,
      hostSet: null,
    };

    const urls = {
      projectScope: null,
      addHostSources: null,
      hostSources: null,
    };

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/targets/target/add-host-sources',
      );

      this.server.create('scope', { id: 'global' }, 'withGlobalAuth');
      await authenticateSession({
        isGlobal: true,
        account_id: this.server.schema.accounts.first().id,
      });
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
      instances.hostCatalog = this.server.create('host-catalog', {
        scope: instances.scopes.project,
      });
      instances.hostSet = this.server.create('host-set', {
        scope: instances.scopes.project,
        hostCatalog: instances.hostCatalog,
      });

      urls.projectScope = `/scopes/${instances.scopes.project.id}`;
      urls.addHostSources = `${urls.projectScope}/targets/${instances.target.id}/add-host-sources`;
      urls.hostSources = `${urls.projectScope}/targets/${instances.target.id}/host-sources`;
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
        {
          host_catalog_id: instances.hostCatalog.id,
          host_source_id: instances.hostSet.id,
        },
      ]);
    });

    test('cancel action causes transition to expected route', async function (assert) {
      await visit(urls.addHostSources);

      await controller.cancel();

      assert.strictEqual(currentURL(), urls.hostSources);
    });
  },
);
