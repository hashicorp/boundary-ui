/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credential-libraries/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;
    let getCredentialLibraryCount;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      credentialStore: null,
      credentialLibrary: null,
    };

    const urls = {
      credentialLibraries: null,
    };

    hooks.beforeEach(async function () {
      await authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credential-libraries/index',
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
      instances.credentialStore = this.server.create('credential-store', {
        scope: instances.scopes.project,
      });
      instances.credentialLibrary = this.server.create('credential-library', {
        credentialStore: instances.credentialStore,
        extensions: [{ key: 'foo', value: 'bar' }],
      });

      urls.credentialLibraries = `/scopes/${instances.scopes.project.id}/credential-stores/${instances.credentialStore.id}/credential-libraries`;

      getCredentialLibraryCount = () =>
        this.server.schema.credentialLibraries.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.credentialStores);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.credentialLibraries);
      const credentialLibrary = await store.findRecord(
        'credential-library',
        instances.credentialLibrary.id,
      );
      credentialLibrary.name = 'test';

      assert.strictEqual(credentialLibrary.name, 'test');

      await controller.cancel(credentialLibrary);

      assert.notEqual(credentialLibrary.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.credentialLibraries);
      const credentialLibrary = await store.findRecord(
        'credential-library',
        instances.credentialLibrary.id,
      );
      credentialLibrary.name = 'test';

      await controller.save(credentialLibrary);

      assert.strictEqual(credentialLibrary.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      const credentialLibrary = await store.findRecord(
        'credential-library',
        instances.credentialLibrary.id,
      );
      const credentialLibraryCount = getCredentialLibraryCount();

      await controller.delete(credentialLibrary);

      assert.strictEqual(
        getCredentialLibraryCount(),
        credentialLibraryCount - 1,
      );
    });

    test('edit action updates to a dirty state', async function (assert) {
      const credentialLibrary = await store.findRecord(
        'credential-library',
        instances.credentialLibrary.id,
      );

      assert.false(credentialLibrary.hasDirtyAttributes);

      controller.edit(credentialLibrary);

      assert.true(credentialLibrary.hasDirtyAttributes);
    });
  },
);
