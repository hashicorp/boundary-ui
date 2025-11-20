/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_CREDENTIAL_STORE_VAULT } from 'api/models/credential-store';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credential-libraries/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);
    setupIntl(hooks, 'en-us');

    let intl;
    let store;
    let controller;
    let getCredentialLibraryCount;

    const instances = {
      scopes: {
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
      intl = intl = this.owner.lookup('service:intl');
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credential-libraries/index',
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
      instances.credentialStore = this.server.create('credential-store', {
        type: TYPE_CREDENTIAL_STORE_VAULT,
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

    test('messageDescription returns correct translation with list authorization', async function (assert) {
      await visit(urls.credentialLibraries);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('resources.credential-library.description'),
      );
    });

    test('messageDescription returns correct translation with create authorization', async function (assert) {
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ] = ['create'];
      await visit(urls.credentialLibraries);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.create-but-not-list', {
          resource: intl.t('resources.credential-library.title_plural'),
        }),
      );
    });

    test('messageDescription returns correct translation with no authorization', async function (assert) {
      instances.credentialStore.authorized_collection_actions[
        'credential-libraries'
      ] = [];
      await visit(urls.credentialLibraries);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.neither-list-nor-create', {
          resource: intl.t('resources.credential-library.title_plural'),
        }),
      );
    });
  },
);
