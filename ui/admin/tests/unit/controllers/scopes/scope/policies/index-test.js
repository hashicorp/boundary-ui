/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | scopes/scope/policies/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  let intl;
  let store;
  let controller;
  let getPolicyCount;

  const instances = {
    scopes: {
      global: null,
    },
    policy: null,
  };

  const urls = {
    policies: null,
  };

  hooks.beforeEach(async function () {
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:scopes/scope/policies/index');

    instances.scopes.global = this.server.create(
      'scope',
      { id: 'global' },
      'withGlobalAuth',
    );
    await authenticateSession({
      isGlobal: true,
      account_id: this.server.schema.accounts.first().id,
    });
    instances.policy = this.server.create('policy', {
      scopeId: 'global',
    });

    urls.policies = '/scopes/global/policies';

    getPolicyCount = () => this.server.schema.policies.all().models.length;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('cancel action rolls-back changes on the specified model', async function (assert) {
    await visit(urls.policies);
    const policyBefore = await store.findRecord('policy', instances.policy.id);
    policyBefore.name = 'test';

    assert.strictEqual(policyBefore.name, 'test');

    await controller.cancel(policyBefore);
    const policyAfter = await store.findRecord('policy', instances.policy.id);

    assert.notEqual(policyAfter.name, 'test');
    assert.deepEqual(policyBefore, policyAfter);
  });

  test('save action saves changes on the specified model', async function (assert) {
    await visit(urls.policies);
    const policyBefore = await store.findRecord('policy', instances.policy.id);
    policyBefore.name = 'test';

    await controller.save(policyBefore);
    const policyAfter = await store.findRecord('policy', instances.policy.id);

    assert.strictEqual(policyAfter.name, 'test');
  });

  test('delete action destroys specified model', async function (assert) {
    const policy = await store.findRecord('policy', instances.policy.id);
    const policyCount = getPolicyCount();

    await controller.delete(policy);

    assert.strictEqual(getPolicyCount(), policyCount - 1);
  });

  test('messageDescription returns correct translation with list authorization', async function (assert) {
    await visit(urls.policies);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('resources.policy.messages.none.description'),
    );
  });

  test('messageDescription returns correct translation with create authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.policies = ['create'];
    await visit(urls.policies);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.create-but-not-list', {
        resource: intl.t('resources.policy.title_plural'),
      }),
    );
  });

  test('messageDescription returns correct translation with no authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions.policies = [];
    await visit(urls.policies);

    assert.strictEqual(
      controller.messageDescription,
      intl.t('descriptions.neither-list-nor-create', {
        resource: intl.t('resources.policy.title_plural'),
      }),
    );
  });
});
