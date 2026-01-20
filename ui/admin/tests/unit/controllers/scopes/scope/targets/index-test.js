/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit, waitUntil } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_TARGET_TCP,
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
} from 'api/models/target';

module('Unit | Controller | scopes/scope/targets/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let intl;
  let store;
  let controller;
  let getTargetCount;
  let getAliasCount;
  let features;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
    hostSet: null,
    credential: null,
    alias: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    alias: null,
  };

  hooks.beforeEach(async function () {
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/targets/index');
    features = this.owner.lookup('service:features');

    instances.scopes.global = this.server.create(
      'scope',
      { id: 'global' },
      'withGlobalAuth',
    );
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
    instances.hostSet = this.server.create('host-set', {
      scope: instances.scopes.project,
    });
    instances.credential = this.server.create('credential', {
      scope: instances.scopes.project,
    });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.alias = `${urls.target}/${instances.alias.id}`;

    getTargetCount = () => this.server.schema.targets.all().models.length;
    getAliasCount = () => this.server.schema.aliases.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('availableSessionOptions returns expected object', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.deepEqual(controller.availableSessionOptions, [
      { id: 'yes', name: 'Has active sessions' },
      { id: 'no', name: 'No active sessions' },
    ]);
  });

  test('targetTypeOptions returns expected object', function (assert) {
    features.enable('rdp-target');
    features.enable('ssh-target');
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.deepEqual(controller.targetTypeOptions, [
      { id: TYPE_TARGET_TCP, name: 'Generic TCP' },
      { id: TYPE_TARGET_SSH, name: 'SSH' },
      { id: TYPE_TARGET_RDP, name: 'RDP' },
    ]);
  });

  test('filters returns expected entries', function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    assert.ok(controller.filters.allFilters);
    assert.ok(controller.filters.selectedFilters);
  });

  test('handleSearchInput action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    const searchValue = 'test';
    controller.handleSearchInput({ target: { value: searchValue } });
    await waitUntil(() => controller.search === searchValue);

    assert.strictEqual(controller.page, 1);
    assert.strictEqual(controller.search, searchValue);
  });

  test('applyFilter action sets expected values correctly', async function (assert) {
    let controller = this.owner.lookup('controller:scopes/scope/targets/index');
    const selectedItems = ['yes'];
    controller.applyFilter('availableSessions', selectedItems);

    assert.strictEqual(controller.page, 1);
    assert.deepEqual(controller.availableSessions, selectedItems);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.targets);
    const target = await store.findRecord('target', instances.target.id);
    target.name = 'test';

    assert.strictEqual(target.name, 'test');

    await controller.cancel(target);

    assert.notEqual(target.name, 'test');
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.targets);
    const target = await store.findRecord('target', instances.target.id);
    target.name = 'test';

    await controller.save(target);

    assert.strictEqual(target.name, 'test');
  });

  test('saveWithAddress action saves address and removes host sources on the specified model', async function (assert) {
    await visit(urls.targets);
    const target = await store.findRecord('target', instances.target.id);
    await target.addHostSources([instances.hostSet.id]);
    target.address = '127.0.0.1';

    assert.deepEqual(target.host_sources, [
      { host_source_id: instances.hostSet.id },
    ]);

    await controller.saveWithAddress(target);

    assert.deepEqual(target.host_sources, []);
    assert.strictEqual(target.address, '127.0.0.1');
  });

  test('delete action destroys specified model', async function (assert) {
    await visit(urls.orgScope);
    const target = await store.findRecord('target', instances.target.id);
    const targetCount = getTargetCount();

    await controller.delete(target);

    assert.strictEqual(getTargetCount(), targetCount - 1);
  });

  test('removeHostSource action removes specified host-set from model', async function (assert) {
    await visit(urls.targets);
    const target = await store.findRecord('target', instances.target.id);
    await target.addHostSources([instances.hostSet.id]);

    assert.deepEqual(target.host_sources, [
      { host_source_id: instances.hostSet.id },
    ]);

    await controller.removeHostSource(target, instances.hostSet);

    assert.deepEqual(target.host_sources, []);
  });

  test('removeInjectedApplicationCredentialSource action removes specified credential from model', async function (assert) {
    await visit(urls.targets);
    const target = await store.findRecord('target', instances.target.id);
    await target.addInjectedApplicationCredentialSources([
      instances.credential.id,
    ]);

    assert.deepEqual(target.injected_application_credential_source_ids, [
      { value: instances.credential.id },
    ]);

    await controller.removeInjectedApplicationCredentialSource(
      target,
      instances.credential,
    );

    assert.deepEqual(target.injected_application_credential_source_ids, []);
  });

  test('removeBrokeredCredentialSource action removes specified credential from model', async function (assert) {
    await visit(urls.targets);
    const target = await store.findRecord('target', instances.target.id);
    await target.addBrokeredCredentialSources([instances.credential.id]);

    assert.deepEqual(target.brokered_credential_source_ids, [
      { value: instances.credential.id },
    ]);

    await controller.removeBrokeredCredentialSource(
      target,
      instances.credential,
    );

    assert.deepEqual(target.brokered_credential_source_ids, []);
  });

  test('deleteAlias action destroys specified model', async function (assert) {
    await visit(urls.target);
    const alias = await store.findRecord('alias', instances.alias.id);
    const aliasCount = getAliasCount();

    await controller.deleteAlias(alias);

    assert.strictEqual(getAliasCount(), aliasCount - 1);
  });

  test('clearAlias action removes destination_id from model', async function (assert) {
    await visit(urls.alias);
    const alias = await store.findRecord('alias', instances.alias.id);
    alias.destination_id = 'www.test.com';

    assert.strictEqual(alias.destination_id, 'www.test.com');

    await controller.clearAlias(alias);

    assert.notOk(alias.destination_id);
  });

  test('saveAlias action saves changes on the specified model', async function (assert) {
    await visit(urls.alias);
    const alias = await store.findRecord('alias', instances.alias.id);
    alias.name = 'test';

    await controller.saveAlias(alias);

    assert.strictEqual(alias.name, 'test');
  });

  test('cancelAlias action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.alias);
    const alias = await store.findRecord('alias', instances.alias.id);
    alias.name = 'test';

    assert.strictEqual(alias.name, 'test');

    await controller.cancelAlias(alias);

    assert.notEqual(alias.name, 'test');
  });

  test('cancelWorkerFilter action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.target);
    const target = await store.findRecord('target', instances.target.id);
    target.egress_worker_filter = 'test';

    assert.strictEqual(target.egress_worker_filter, 'test');

    await controller.cancelWorkerFilter(target);

    assert.notEqual(target.egress_worker_filter, 'test');
  });

  test('saveWorkerFilter action saves changes on the specified model', async function (assert) {
    await visit(urls.target);
    const target = await store.findRecord('target', instances.target.id);
    target.egress_worker_filter = 'test';

    await controller.saveWorkerFilter(target);

    assert.strictEqual(target.egress_worker_filter, 'test');
  });

  test('messageDescription returns correct translation with list authorization', async function (assert) {
    await visit(urls.targets);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('resources.target.description'),
    );
  });

  test('messageDescription returns correct translation with create authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets = ['create'];
    await visit(urls.targets);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.create-but-not-list', {
        resource: intl.t('resources.target.title_plural'),
      }),
    );
  });

  test('messageDescription returns correct translation with no authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.targets);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.neither-list-nor-create', {
        resource: intl.t('resources.target.title_plural'),
      }),
    );
  });
});
