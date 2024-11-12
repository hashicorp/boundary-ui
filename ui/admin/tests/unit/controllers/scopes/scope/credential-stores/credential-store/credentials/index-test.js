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
  'Unit | Controller | scopes/scope/credential-stores/credential-store/credentials/index',
  function (hooks) {
    setupTest(hooks);
    setupMirage(hooks);
    setupIndexedDb(hooks);
    setupIntl(hooks, 'en-us');

    let store;
    let controller;
    let getCredentialCount;

    const instances = {
      scopes: {
        global: null,
        org: null,
        project: null,
      },
      credentialStore: null,
      credential: null,
    };

    const urls = {
      credentials: null,
    };

    hooks.beforeEach(function () {
      authenticateSession({});
      store = this.owner.lookup('service:store');
      controller = this.owner.lookup(
        'controller:scopes/scope/credential-stores/credential-store/credentials/index',
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
  },
);
