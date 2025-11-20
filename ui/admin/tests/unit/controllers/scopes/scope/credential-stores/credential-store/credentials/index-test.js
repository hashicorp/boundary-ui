/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_CREDENTIAL_STORE_STATIC } from 'api/models/credential-store';

module(
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credentials/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupSqlite(hooks);
    setupIntl(hooks, 'en-us');

    let intl;
    let store;
    let controller;
    let getCredentialCount;

    const instances = {
      scopes: {
        org: null,
        project: null,
      },
      credentialStore: null,
      credential: null,
    };

    const urls = {
      credentials: null,
    };

    hooks.beforeEach(async function () {
      intl = this.owner.lookup('service:intl');
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credentials/index',
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
        type: TYPE_CREDENTIAL_STORE_STATIC,
        scope: instances.scopes.project,
      });
      instances.credential = this.server.create('credential', {
        credentialStore: instances.credentialStore,
        extensions: [{ key: 'foo', value: 'bar' }],
      });

      urls.credentials = `/scopes/${instances.scopes.project.id}/credential-stores/${instances.credentialStore.id}/credentials`;

      getCredentialCount = () =>
        this.server.schema.credentials.all().models.length;
    });

    test('it exists', function (assert) {
      assert.ok(controller);
      assert.ok(controller.credentialStores);
    });

    test('cancel action rolls-back changes on the specified model', async function (assert) {
      await visit(urls.credentials);
      const credential = await store.findRecord(
        'credential',
        instances.credential.id,
      );
      credential.name = 'test';

      assert.strictEqual(credential.name, 'test');

      await controller.cancel(credential);

      assert.notEqual(credential.name, 'test');
    });

    test('save action saves changes on the specified model', async function (assert) {
      await visit(urls.credentials);
      const credential = await store.findRecord(
        'credential',
        instances.credential.id,
      );
      credential.name = 'test';

      await controller.save(credential);

      assert.strictEqual(credential.name, 'test');
    });

    test('delete action destroys specified model', async function (assert) {
      const credential = await store.findRecord(
        'credential',
        instances.credential.id,
      );
      const credentialCount = getCredentialCount();

      await controller.delete(credential);

      assert.strictEqual(getCredentialCount(), credentialCount - 1);
    });

    test('messageDescription returns correct translation with list authorization', async function (assert) {
      await visit(urls.credentials);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('resources.credential.description'),
      );
    });

    test('messageDescription returns correct translation with create authorization', async function (assert) {
      instances.credentialStore.authorized_collection_actions.credentials = [
        'create',
      ];
      await visit(urls.credentials);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.create-but-not-list', {
          resource: intl.t('resources.credential.title_plural'),
        }),
      );
    });

    test('messageDescription returns correct translation with no authorization', async function (assert) {
      instances.credentialStore.authorized_collection_actions.credentials = [];
      await visit(urls.credentials);

      assert.strictEqual(
        controller.messageDescription,
        intl.t('descriptions.neither-list-nor-create', {
          resource: intl.t('resources.credential.title_plural'),
        }),
      );
    });
  },
);
