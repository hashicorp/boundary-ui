/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const MANAGE_DROPDOWN_TOGGLE =
    '[data-test-manage-worker-dropdown] div button';
  const REMOVE_WORKER_BUTTON =
    '[data-test-manage-worker-dropdown] div:nth-child(2) button';
  let getWorkerCount;

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.workers = `${urls.globalScope}/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;

    getWorkerCount = () => this.server.schema.workers.all().models.length;

    authenticateSession({});
  });

  test('can delete a worker', async function (assert) {
    const count = getWorkerCount();
    await visit(urls.worker);
    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(REMOVE_WORKER_BUTTON);
    assert.strictEqual(getWorkerCount(), count - 1);
  });

  test('can accept delete worker via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getWorkerCount();
    await visit(urls.worker);
    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(REMOVE_WORKER_BUTTON);
    assert.strictEqual(getWorkerCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('can cancel delete worker via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getWorkerCount();
    await visit(urls.worker);
    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(REMOVE_WORKER_BUTTON);
    assert.strictEqual(getWorkerCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot delete worker without proper authorization', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.worker);
    await click(MANAGE_DROPDOWN_TOGGLE);
    assert.dom(REMOVE_WORKER_BUTTON).isNotVisible();
  });

  test('deleting a worker which errors displays error messages', async function (assert) {
    this.server.del('/workers/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });
    await visit(urls.worker);
    await click(MANAGE_DROPDOWN_TOGGLE);
    await click(REMOVE_WORKER_BUTTON);
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
